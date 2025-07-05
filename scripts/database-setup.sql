-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_name TEXT,
  plaid_access_token TEXT,
  plaid_item_id TEXT,
  plaid_accounts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plaid_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  plaid_account_id VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  iso_currency_code VARCHAR(3) DEFAULT 'USD',
  unofficial_currency_code VARCHAR(10),
  date DATE NOT NULL,
  datetime TIMESTAMP WITH TIME ZONE,
  authorized_date DATE,
  authorized_datetime TIMESTAMP WITH TIME ZONE,
  name TEXT NOT NULL,
  merchant_name TEXT,
  category JSONB DEFAULT '[]'::jsonb,
  subcategory TEXT,
  account_owner TEXT,
  location JSONB,
  payment_meta JSONB,
  pending BOOLEAN DEFAULT FALSE,
  transaction_type VARCHAR(50),
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table for AI-detected recurring payments
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  merchant_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  frequency VARCHAR(50) NOT NULL, -- monthly, yearly, weekly
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, paused
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_charge_date DATE,
  next_expected_date DATE,
  cancellation_difficulty VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
  merchant_website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_plaid_account_id ON transactions(plaid_account_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
