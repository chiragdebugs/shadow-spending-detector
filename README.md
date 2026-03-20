# Shadow Spending Detector 💰

A full-stack web application that helps users detect hidden recurring expenses, subscriptions, and unnecessary spending patterns from their bank transaction data.

## Features

✨ **Core Features:**
- 🔐 Secure authentication (email + password via Supabase Auth)
- 📊 Modern fintech dashboard with spending analytics
- 📁 CSV bank statement upload with smart parsing
- 🔄 **Intelligent recurring payment detection** (core algorithm)
- 💳 Automatic subscription discovery
- 💸 Waste analysis and money-saving insights
- 📈 Visual charts (spending over time, category breakdown)
- 🏷️ Auto-categorization of transactions
- 🌓 Dark/Light mode toggle
- 📱 Responsive design (mobile + desktop)

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + React 18
- **Styling:** Tailwind CSS + shadcn/ui components  
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Charts:** Recharts
- **CSV Parsing:** PapaParse

## Setup Instructions

### 1. Database Setup

The application requires two tables in your Supabase database. Follow these steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `/lib/setupDatabase.sql` 
5. Click **Run** to create the tables and policies

This will create:
- `transactions` table (stores all user transactions)
- `subscriptions` table (stores detected recurring subscriptions)
- Row Level Security (RLS) policies for data privacy
- Indexes for query performance

### 2. Environment Variables

Already configured in `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://kqyuyybpktxmeyufdjgi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 3. Installation

Dependencies are already installed via `package.json`:
- @supabase/supabase-js
- papaparse
- recharts
- date-fns
- shadcn/ui components

### 4. Running the Application

The app is already running on:
- Local: http://localhost:3000
- Network: http://0.0.0.0:3000

## How to Use

### Step 1: Sign Up / Login
1. Visit the homepage
2. Create a new account or login
3. All your data will be private and encrypted

### Step 2: Upload Transactions
1. Go to the **Upload Data** tab
2. Upload your CSV bank statement
   - Required columns: Date, Description, Amount
   - Accepts various date formats (DD/MM/YYYY, MM/DD/YYYY, etc.)
3. Preview the parsed data
4. Click **Upload All Transactions**

### Step 3: View Dashboard
The dashboard automatically displays:
- Total spending across all transactions
- Number of detected subscriptions
- Monthly subscription costs
- Yearly subscription costs
- Potential savings (money wasted)
- Spending trends chart
- Category breakdown chart
- Smart insights and recommendations

### Step 4: Explore Detected Subscriptions
1. Go to **Subscriptions** tab
2. View all recurring payments detected:
   - Monthly subscriptions (e.g., Netflix, Spotify)
   - Weekly patterns
   - Bi-weekly patterns
3. See yearly cost for each subscription

### Step 5: Review Transactions
1. Go to **Transactions** tab
2. Filter by category
3. Search and review all transactions
4. Auto-categorized into: Food, Entertainment, Shopping, Bills, Travel, etc.

## Core Algorithm: Recurring Payment Detection

The application uses an advanced pattern recognition algorithm:

### How it Works:

1. **Similarity Grouping:** 
   - Groups transactions with similar descriptions (Levenshtein distance algorithm)
   - Checks amount similarity (within 10% tolerance)

2. **Interval Analysis:**
   - Calculates time intervals between grouped transactions
   - Identifies patterns: monthly (~30 days), weekly (~7 days), bi-weekly (~14 days)
   - Uses variance analysis to confirm consistency

3. **Subscription Extraction:**
   - Extracts clean subscription names from descriptions
   - Calculates average amount
   - Determines frequency (monthly, weekly, bi-weekly)
   - Requires 2+ occurrences for detection

4. **Waste Analysis:**
   - Detects low-value repeated payments
   - Identifies potential duplicate subscriptions
   - Highlights unused or rarely used services

## CSV Format

Your bank statement CSV should have these columns:
- **Date:** Transaction date (various formats supported)
- **Description/Narration:** Transaction description
- **Amount/Debit:** Transaction amount

Example:
```csv
Date,Description,Debit Amount
01/01/2025,Netflix Subscription,199.00
05/01/2025,Swiggy Food Delivery,450.00
15/01/2025,Electricity Bill,1200.00
01/02/2025,Netflix Subscription,199.00
```

## Features Breakdown

### Dashboard
- Total spending overview
- Active subscriptions count
- Monthly & yearly subscription costs
- Potential savings calculator
- Smart insights (e.g., "You spent more on weekends")
- Spending over time chart
- Category-wise spending pie chart
- Money waste analysis

### Subscription Insights
- Detected recurring payments
- Frequency detection (monthly/weekly)
- Yearly cost projection
- Last detected date
- Duplicate subscription warnings
- Price increase alerts

### Waste Analysis
- Low-value repeated payments
- Unused subscriptions detection
- Duplicate subscriptions
- Monthly savings opportunities

### Categories
Auto-categorizes transactions into:
- Food & Dining
- Entertainment (Netflix, Spotify, etc.)
- Shopping
- Bills (electricity, internet, mobile)
- Travel (Uber, Ola, fuel)
- Health
- Education
- Others

### Settings
- Export all data as CSV
- Delete all data (with confirmation)
- Currency: ₹ (Indian Rupees)

## Security Features

- Supabase Authentication (email + password)
- Row Level Security (RLS) on all tables
- Each user can only access their own data
- Encrypted data storage
- Secure session handling

## Project Structure

```
/app
├── app/
│   ├── page.js                    # Auth page (login/signup)
│   ├── dashboard/page.js          # Main dashboard
│   ├── layout.js                  # Root layout with theme
│   ├── globals.css                # Global styles
│   └── api/[[...path]]/route.js  # API routes
├── lib/
│   ├── supabase.js                # Supabase client
│   ├── recurringDetection.js     # Core algorithm
│   ├── csvParser.js               # CSV parser
│   └── setupDatabase.sql          # Database schema
├── components/
│   ├── ui/                        # shadcn components
│   └── theme-provider.jsx         # Dark mode provider
└── package.json
```

## API Endpoints

### GET `/api`
- `?action=transactions&userId={id}` - Get all transactions
- `?action=subscriptions&userId={id}` - Get detected subscriptions
- `?action=stats&userId={id}` - Get dashboard statistics

### POST `/api`
- `action=upload` - Upload and parse transactions
- `action=deleteAll` - Delete all user data
- `action=updateCategory` - Update transaction category

### DELETE `/api`
- `?transactionId={id}&userId={id}` - Delete specific transaction

## Development

The app uses Next.js hot reload:
- Frontend changes auto-reload
- Backend API changes auto-reload
- Only restart for: dependency changes, .env changes

Restart server:
```bash
sudo supervisorctl restart nextjs
```

## Deployment Ready

- Environment variables properly configured
- Production-ready code structure
- Error handling implemented
- Loading states added
- Empty states for no data
- Responsive design

## Future Enhancements (Not Implemented)

- Email notifications for detected subscriptions
- Budget tracking
- Spending limits and alerts
- Multi-currency support
- Bank account integration
- Mobile app
- Export to PDF
- Sharing insights

## Support

For issues or questions about the application, contact your administrator.

---

**Built with ❤️ using Next.js, Supabase, and Tailwind CSS**
