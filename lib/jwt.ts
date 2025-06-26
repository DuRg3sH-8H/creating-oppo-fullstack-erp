import jwt from "jsonwebtoken"
import type { User } from "@/models/user"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRY = "7d" // 7 days

export function generateToken(user: Partial<User>) {
  try {
    // Don't include sensitive information in the token
    const payload = {
      userId: user._id?.toString() || user._id, // Make sure we use userId consistently
      id: user._id?.toString() || user._id, // Keep both for compatibility
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      iat: Math.floor(Date.now() / 1000), // issued at
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
    return token
  } catch (error) {
    throw error
  }
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Ensure we have userId field
    if (decoded && !decoded.userId && decoded.id) {
      decoded.userId = decoded.id
    }

    return decoded
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

// Add a new function to verify JWT specifically
export function verifyJWT(token: string) {
  return verifyToken(token)
}
