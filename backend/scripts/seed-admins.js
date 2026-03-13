import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import pool from '../db/index.js';

// Define your admin accounts here
// Run: node scripts/seed-admins.js  (from the backend/ directory)
const admins = [
  { username: 'admin', password: 'admin123' },
  { username: 'manager', password: 'manager123' },
  // Add more admins here:
  // { username: 'yourname', password: 'yourpassword' },
];

async function seed() {
  console.log('Seeding admin accounts...\n');

  for (const admin of admins) {
    const hash = await bcrypt.hash(admin.password, 12);
    try {
      await pool.query(
        `INSERT INTO admins (username, password_hash, role)
         VALUES ($1, $2, 'admin')
         ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [admin.username.toLowerCase(), hash]
      );
      console.log(`✓ Admin created/updated: ${admin.username}`);
    } catch (err) {
      console.error(`✗ Failed for ${admin.username}:`, err.message);
    }
  }

  console.log('\nDone! You can now login with the admin credentials above.');
  process.exit(0);
}

seed();
