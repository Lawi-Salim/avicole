import { User } from '../auth/user.entity.js';
import bcrypt from 'bcryptjs';

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME;
  const lastName = process.env.ADMIN_LAST_NAME;

  if (!email || !password || !firstName || !lastName) {
    console.warn('Admin seed skipped: missing environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME)');
    return;
  }

  const existing = await User.findOne({ where: { role: 'admin' } });

  if (existing) {
    console.log('Admin user already exists, skipping seed');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    nom: `${firstName} ${lastName}`,
    email,
    password_hash: passwordHash,
    role: 'admin',
    actif: true,
  });

  console.log('Admin user created successfully');
}
