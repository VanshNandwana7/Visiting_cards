import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/extract-card — protected
// Calls Gemini AI to extract business card data from base64 images
router.post('/extract-card', authenticateToken, async (req, res) => {
  const { images } = req.body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'No images provided.' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    // Build Gemini-compatible image parts from base64 data URLs
    const imageParts = images.map((dataUrl) => {
      // dataUrl is like: "data:image/jpeg;base64,/9j/4AAQ..."
      const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
      if (!matches) throw new Error('Invalid image format. Expected base64 data URL.');
      return {
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      };
    });

    const systemInstruction = `You are a visiting card data extractor. Extract ALL visiting cards visible in the provided images. Multiple images may represent front and back of the same card - match them intelligently based on company name or person name.

For each unique card, extract:
- company_name: Company/organization name
- owner_name: Person's name on the card
- designation: Title/designation
- address: Full address
- city: City
- state: State
- pin_code: Pin/ZIP code
- phone_numbers: Array of phone numbers (mobile, landline, fax)
- email: Email address(es)
- website: Website if present
- category: Suggest one of: "manufacturer", "wholesaler", "retailer", "supplier", "vvip" based on any clues on the card. Default to "manufacturer" if unclear.

If a field is not present, use an empty string or empty array for phone_numbers.
If multiple cards are in a single image, extract each separately.
If front and back images of the same card are provided, merge the data.

Return ONLY a valid JSON object like: { "cards": [ { ...card fields... } ] }. No markdown, no explanation.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [
            {
              role: 'user',
              parts: [
                { text: 'Extract all visiting card data from these images. Return a JSON object with a "cards" array.' },
                ...imageParts,
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                cards: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      company_name: { type: 'string' },
                      owner_name: { type: 'string' },
                      designation: { type: 'string' },
                      address: { type: 'string' },
                      city: { type: 'string' },
                      state: { type: 'string' },
                      pin_code: { type: 'string' },
                      phone_numbers: { type: 'array', items: { type: 'string' } },
                      email: { type: 'string' },
                      website: { type: 'string' },
                      category: { type: 'string', enum: ['manufacturer', 'wholesaler', 'retailer', 'supplier', 'vvip'] },
                    },
                    required: ['company_name', 'owner_name', 'phone_numbers', 'category'],
                  },
                },
              },
              required: ['cards'],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API error:', response.status, errorBody);
      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limited by Gemini API. Please try again shortly.' });
      }
      return res.status(500).json({ error: 'AI extraction failed. Please try again.' });
    }

    const geminiData = await response.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{"cards":[]}';

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error('Failed to parse Gemini JSON response:', rawText);
      return res.status(500).json({ error: 'AI returned invalid data. Please try again.' });
    }

    let cards = (parsed.cards || []).map((card, idx) => ({
      serial_number: idx + 1,
      company_name: card.company_name || '',
      owner_name: card.owner_name || '',
      designation: card.designation || '',
      address: card.address || '',
      city: card.city || '',
      state: card.state || '',
      pin_code: card.pin_code || '',
      phone_numbers: card.phone_numbers || [],
      email: card.email || '',
      website: card.website || '',
      category: card.category || 'manufacturer',
    }));

    res.json({ cards });
  } catch (err) {
    console.error('extract-card error:', err);
    res.status(500).json({ error: err.message || 'Unknown error during extraction.' });
  }
});

// GET /api/cards — fetch all cards (protected)
router.get('/cards', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM extracted_cards ORDER BY extracted_at DESC LIMIT 1000'
    );
    res.json({ cards: result.rows });
  } catch (err) {
    console.error('Fetch cards error:', err);
    res.status(500).json({ error: 'Failed to fetch cards.' });
  }
});

// POST /api/cards — save extracted cards (protected)
router.post('/cards', authenticateToken, async (req, res) => {
  const { cards } = req.body;

  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    return res.status(400).json({ error: 'No cards to save.' });
  }

  try {
    const insertPromises = cards.map((c) =>
      pool.query(
        `INSERT INTO extracted_cards
          (serial_number, company_name, owner_name, designation, address, city, state, pin_code, phone_numbers, email, website, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          c.serial_number,
          c.company_name || '',
          c.owner_name || '',
          c.designation || '',
          c.address || '',
          c.city || '',
          c.state || '',
          c.pin_code || '',
          c.phone_numbers || [],
          c.email || '',
          c.website || '',
          c.category || 'manufacturer',
        ]
      )
    );

    const results = await Promise.all(insertPromises);
    const ids = results.map((r) => r.rows[0].id);
    res.json({ success: true, ids });
  } catch (err) {
    console.error('Save cards error:', err);
    res.status(500).json({ error: 'Failed to save cards.' });
  }
});

// DELETE /api/cards/:id — delete a card (protected)
router.delete('/cards/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM extracted_cards WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete card error:', err);
    res.status(500).json({ error: 'Failed to delete card.' });
  }
});

// DELETE /api/cards/batch — delete multiple cards by IDs (protected)
router.post('/cards/delete-batch', authenticateToken, async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No IDs provided.' });
  }
  try {
    await pool.query(
      'DELETE FROM extracted_cards WHERE id = ANY($1::uuid[])',
      [ids]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Delete batch error:', err);
    res.status(500).json({ error: 'Failed to delete cards.' });
  }
});

export default router;
