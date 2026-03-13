
CREATE TABLE public.extracted_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number INTEGER NOT NULL,
  company_name TEXT NOT NULL DEFAULT '',
  owner_name TEXT NOT NULL DEFAULT '',
  designation TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  pin_code TEXT NOT NULL DEFAULT '',
  phone_numbers TEXT[] NOT NULL DEFAULT '{}',
  email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'manufacturer',
  extracted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS needed since this is a public tool without auth
ALTER TABLE public.extracted_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to extracted_cards"
ON public.extracted_cards
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
