import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { createLinkToken } from "@/lib/plaid"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)

    const linkToken = await createLinkToken(user.id)

    return NextResponse.json({ link_token: linkToken })
  } catch (error) {
    console.error("Link token creation error:", error)
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 })
  }
}
