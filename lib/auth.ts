import type { NextRequest } from "next/server"
import { supabase } from "./supabase"
import jwt from "jsonwebtoken"

export async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No authorization header")
    }

    const token = authHeader.substring(7)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      throw new Error("Invalid token")
    }

    return user
  } catch (error) {
    throw new Error("Authentication failed")
  }
}

export function generateJWT(userId: string) {
  return jwt.sign({ userId, iat: Math.floor(Date.now() / 1000) }, process.env.JWT_SECRET!, { expiresIn: "24h" })
}

export function verifyJWT(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
  } catch (error) {
    throw new Error("Invalid JWT token")
  }
}
