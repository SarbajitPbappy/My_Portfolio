import bcrypt from 'bcryptjs'

// Simple password-based authentication
// In production, consider using NextAuth.js or similar
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''

export async function verifyPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD_HASH) {
    // Development fallback - set a default password hash
    // You should generate a proper hash using: bcrypt.hashSync('your-password', 10)
    return password === process.env.ADMIN_PASSWORD || false
  }
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

