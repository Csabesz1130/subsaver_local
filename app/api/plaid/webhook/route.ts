import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getTransactions, decrypt } from "@/lib/plaid"

export async function POST(request: NextRequest) {
  try {
    const webhook = await request.json()

    // Verify webhook (implement webhook verification in production)
    if (webhook.webhook_type === "TRANSACTIONS") {
      const { item_id, new_transactions, removed_transactions } = webhook

      // Find user by item_id
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("id, plaid_access_token")
        .eq("plaid_item_id", item_id)
        .single()

      if (!user || !user.plaid_access_token) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const accessToken = decrypt(user.plaid_access_token)

      // Handle new transactions
      if (new_transactions > 0) {
        const endDate = new Date().toISOString().split("T")[0]
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

        const transactions = await getTransactions(accessToken, startDate, endDate)

        const transactionData = transactions.map((transaction) => ({
          user_id: user.id,
          plaid_transaction_id: transaction.transaction_id,
          plaid_account_id: transaction.account_id,
          amount: transaction.amount,
          iso_currency_code: transaction.iso_currency_code,
          date: transaction.date,
          name: transaction.name,
          merchant_name: transaction.merchant_name,
          category: transaction.category,
          pending: transaction.pending,
        }))

        await supabaseAdmin.from("transactions").upsert(transactionData, { onConflict: "plaid_transaction_id" })
      }

      // Handle removed transactions
      if (removed_transactions?.length > 0) {
        await supabaseAdmin
          .from("transactions")
          .delete()
          .in(
            "plaid_transaction_id",
            removed_transactions.map((t: any) => t.transaction_id),
          )
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
