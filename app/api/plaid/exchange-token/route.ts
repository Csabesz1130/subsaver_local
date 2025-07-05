import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { exchangePublicToken, getAccounts, getTransactions, encrypt } from "@/lib/plaid"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const { public_token } = await request.json()

    if (!public_token) {
      return NextResponse.json({ error: "Public token is required" }, { status: 400 })
    }

    // Exchange public token for access token
    const { access_token, item_id } = await exchangePublicToken(public_token)

    // Get account information
    const accounts = await getAccounts(access_token)

    // Encrypt sensitive data
    const encryptedAccessToken = encrypt(access_token)

    // Update user with Plaid information
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        plaid_access_token: encryptedAccessToken,
        plaid_item_id: item_id,
        plaid_accounts: accounts,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      throw new Error("Failed to update user data")
    }

    // Fetch last 6 months of transactions
    const endDate = new Date().toISOString().split("T")[0]
    const startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const transactions = await getTransactions(access_token, startDate, endDate)

    // Store transactions in database
    const transactionData = transactions.map((transaction) => ({
      user_id: user.id,
      plaid_transaction_id: transaction.transaction_id,
      plaid_account_id: transaction.account_id,
      amount: transaction.amount,
      iso_currency_code: transaction.iso_currency_code,
      unofficial_currency_code: transaction.unofficial_currency_code,
      date: transaction.date,
      datetime: transaction.datetime,
      authorized_date: transaction.authorized_date,
      authorized_datetime: transaction.authorized_datetime,
      name: transaction.name,
      merchant_name: transaction.merchant_name,
      category: transaction.category,
      subcategory: transaction.category?.[1],
      account_owner: transaction.account_owner,
      location: transaction.location,
      payment_meta: transaction.payment_meta,
      pending: transaction.pending,
      transaction_type: transaction.transaction_type,
      logo_url: transaction.logo_url,
      website: transaction.website,
    }))

    const { error: transactionError } = await supabaseAdmin.from("transactions").upsert(transactionData, {
      onConflict: "plaid_transaction_id",
      ignoreDuplicates: false,
    })

    if (transactionError) {
      console.error("Transaction storage error:", transactionError)
      throw new Error("Failed to store transactions")
    }

    // Update last sync time
    await supabaseAdmin.from("users").update({ last_sync_at: new Date().toISOString() }).eq("id", user.id)

    return NextResponse.json({
      success: true,
      accounts: accounts.length,
      transactions: transactions.length,
      message: "Bank account connected successfully",
    })
  } catch (error) {
    console.error("Token exchange error:", error)
    return NextResponse.json({ error: "Failed to connect bank account" }, { status: 500 })
  }
}
