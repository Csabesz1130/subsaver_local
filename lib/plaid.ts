import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"

const configuration = new Configuration({
  basePath: process.env.PLAID_ENV === "production" ? PlaidEnvironments.production : PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
      "PLAID-SECRET": process.env.PLAID_SECRET!,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)

// Encryption utilities for sensitive data
import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32 bytes key
const ALGORITHM = "aes-256-gcm"

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
  cipher.setAAD(Buffer.from("additional-data"))

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  const authTag = cipher.getAuthTag()

  return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted
}

export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(":")
  const iv = Buffer.from(parts[0], "hex")
  const authTag = Buffer.from(parts[1], "hex")
  const encrypted = parts[2]

  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
  decipher.setAAD(Buffer.from("additional-data"))
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

// Plaid utility functions
export async function createLinkToken(userId: string) {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: "SubSaver",
      products: ["transactions"],
      country_codes: ["US"],
      language: "en",
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/plaid/webhook`,
      account_filters: {
        depository: {
          account_subtypes: ["checking", "savings"],
        },
      },
    })

    return response.data.link_token
  } catch (error) {
    console.error("Error creating link token:", error)
    throw error
  }
}

export async function exchangePublicToken(publicToken: string) {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })

    return {
      access_token: response.data.access_token,
      item_id: response.data.item_id,
    }
  } catch (error) {
    console.error("Error exchanging public token:", error)
    throw error
  }
}

export async function getAccounts(accessToken: string) {
  try {
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    })

    return response.data.accounts
  } catch (error) {
    console.error("Error fetching accounts:", error)
    throw error
  }
}

export async function getTransactions(accessToken: string, startDate: string, endDate: string) {
  try {
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      count: 500,
    })

    return response.data.transactions
  } catch (error) {
    console.error("Error fetching transactions:", error)
    throw error
  }
}
