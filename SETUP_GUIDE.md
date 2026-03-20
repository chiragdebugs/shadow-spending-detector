# 🚀 Shadow Spending Detector - Setup & Usage Guide

## ✅ What's Already Done

Your **Shadow Spending Detector** application is fully built and ready to use! Here's what's been implemented:

### Core Features Implemented:
- ✅ Authentication (Signup/Login with Supabase)
- ✅ Intelligent recurring payment detection algorithm
- ✅ CSV upload with smart parsing
- ✅ Interactive dashboard with charts
- ✅ Subscription detection & analysis
- ✅ Waste analysis & savings insights
- ✅ Transaction management with filtering
- ✅ Auto-categorization (7 categories)
- ✅ Dark/Light mode toggle
- ✅ Export data functionality
- ✅ Responsive design

---

## 📋 One-Time Database Setup (Required)

Before you can use the app, you need to create the database tables in Supabase. This is a **one-time setup** that takes 30 seconds:

### Steps:

1. **Go to Supabase SQL Editor:**
   - Visit: https://supabase.com/dashboard/project/kqyuyybpktxmeyufdjgi/sql/new
   - (Or: Dashboard → Your Project → SQL Editor)

2. **Copy and paste this SQL:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  frequency TEXT NOT NULL,
  last_detected DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON subscriptions FOR DELETE USING (auth.uid() = user_id);
```

3. **Click "Run"** (or press Ctrl+Enter)

4. **✅ Done!** You should see success messages for each table created.

---

## 🎯 How to Use the Application

### Step 1: Create Account
1. Visit: **https://spend-shadow.preview.emergentagent.com**
2. Click **"Sign Up"** tab
3. Enter your email and password (min 6 characters)
4. Click **"Create Account"**
5. You'll be automatically logged in!

### Step 2: Upload Your Bank Statement

**Get a CSV file** from your bank with these columns:
- Date (DD/MM/YYYY or MM/DD/YYYY)
- Description/Narration
- Amount/Debit

**Or use our sample file:**
- Download from: `/tmp/sample_transactions.csv`
- Contains sample Netflix, Spotify, and other subscriptions

**Upload steps:**
1. Go to **"Upload Data"** tab
2. Click **"Choose File"** and select your CSV
3. Preview the parsed transactions
4. Click **"Upload All Transactions"**
5. Wait for processing (algorithm will detect patterns!)

### Step 3: Explore Your Insights

**Dashboard Tab:**
- View total spending
- See detected subscriptions count
- Check potential savings
- Analyze spending charts
- Read AI-generated insights

**Subscriptions Tab:**
- See all detected recurring payments
- View monthly & yearly costs
- Identify expensive subscriptions

**Transactions Tab:**
- Browse all transactions
- Filter by category
- Search specific payments

**Settings Tab:**
- Export your data as CSV
- Delete all data (if needed)

---

## 🧠 How the Algorithm Works

Our intelligent detection system:

1. **Groups Similar Transactions:**
   - Uses Levenshtein distance to match descriptions
   - Compares amounts (within 10% tolerance)

2. **Detects Patterns:**
   - **Monthly**: ~30 days interval (±5 days variance)
   - **Weekly**: ~7 days interval (±2 days variance)
   - **Bi-weekly**: ~14 days interval (±3 days variance)

3. **Extracts Subscriptions:**
   - Cleans up payment processor names
   - Calculates average amounts
   - Determines frequency
   - Requires 2+ occurrences

4. **Analyzes Waste:**
   - Finds low-value repeated payments
   - Detects potential duplicates
   - Calculates savings opportunities

---

## 📊 Sample Data (For Testing)

We've created a sample CSV with realistic data at `/tmp/sample_transactions.csv`:

**What it contains:**
- Netflix (monthly subscription) - 3 payments
- Spotify (monthly subscription) - 3 payments  
- Amazon Prime Video (monthly) - 2 payments
- Jio Mobile Recharge (monthly) - 3 payments
- Random transactions (Swiggy, Uber, shopping)

**Expected Detection:**
- Should detect **4 subscriptions**
- Total monthly subscriptions: ~₹1,216
- Yearly cost: ~₹14,592

---

## 🎨 Features Showcase

### Auto-Categorization
Transactions are automatically sorted into:
- 🍕 Food & Dining
- 🎬 Entertainment  
- 🛍️ Shopping
- 💡 Bills
- 🚗 Travel
- 🏥 Health
- 📚 Education
- 📦 Others

### Smart Insights
Get AI-powered insights like:
- "You have 5 active subscriptions"
- "Subscriptions cost you ₹1,200/month"
- "Your highest spending category is Food at ₹1,500"

### Waste Analysis
Discover:
- Low-value repeated payments
- Potential duplicate subscriptions
- Monthly savings opportunities

---

## 🔒 Security & Privacy

- **Encrypted Data:** All data stored securely in Supabase
- **Row Level Security:** Users can only access their own data
- **Private Accounts:** Each user has isolated financial data
- **No Tracking:** Your financial data never leaves the system

---

## 📱 Access URLs

- **Production:** https://spend-shadow.preview.emergentagent.com
- **Local:** http://localhost:3000

---

## 🐛 Troubleshooting

### Issue: "Table does not exist" error
**Solution:** Run the SQL setup in Supabase Dashboard (see above)

### Issue: Login not working
**Solution:** 
1. Check Supabase email confirmation settings
2. Try signing up with a new email
3. Clear browser cache and try again

### Issue: Subscriptions not detected
**Solution:**
- Upload more transactions (need at least 2 occurrences)
- Ensure transactions have similar descriptions
- Check dates are within reasonable intervals (weekly/monthly)

### Issue: CSV upload fails
**Solution:**
- Ensure CSV has Date, Description, Amount columns
- Check date format is valid (DD/MM/YYYY or MM/DD/YYYY)
- Verify amounts are positive numbers

---

## 📞 Support

For any issues:
1. Check `/app/README.md` for detailed documentation
2. Review browser console for errors
3. Check Supabase logs in dashboard
4. Verify database tables were created correctly

---

## 🎉 You're All Set!

Your Shadow Spending Detector is ready to use. Start by:
1. ✅ Running the SQL setup (if not done)
2. 🔐 Creating your account
3. 📁 Uploading transactions
4. 💡 Discovering hidden costs!

**Happy saving! 💰**
