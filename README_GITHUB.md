# 💰 Shadow Spending Detector

> An intelligent fintech web application that automatically detects hidden recurring subscriptions and unnecessary spending patterns from bank transaction data.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://spend-shadow.preview.emergentagent.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

![Shadow Spending Detector Banner](https://via.placeholder.com/1200x400/8b5cf6/ffffff?text=Shadow+Spending+Detector)

## 🌟 Live Demo

**Try it now:** [https://spend-shadow.preview.emergentagent.com](https://spend-shadow.preview.emergentagent.com)

**Test Account:**
- Email: `demo@test.com`
- Password: `Demo123!`

## 📹 Demo Video

[Watch Demo](https://www.loom.com/share/your-video-id) *(Replace with your own demo video)*

## 🎯 Problem Statement

Most people don't realize how much money they lose to:
- Forgotten subscriptions (Netflix, Spotify, gym memberships)
- Duplicate services (multiple streaming platforms)
- Small recurring charges that add up
- Hidden subscription price increases

**Result:** Hundreds of dollars wasted annually on services you barely use!

## 💡 The Solution

Shadow Spending Detector uses **intelligent pattern recognition algorithms** to:
- 🔍 Automatically detect recurring payments from your transaction history
- 📊 Analyze spending patterns using advanced algorithms
- 💰 Calculate potential savings opportunities
- 📈 Visualize spending trends with interactive charts
- 🎯 Categorize transactions intelligently

## ✨ Key Features

### 🧠 Smart Detection Algorithm
- **Levenshtein Distance** for transaction description matching
- **Time Interval Analysis** (monthly ~30 days, weekly ~7 days)
- **Amount Tolerance Matching** (10% variance allowed)
- **Frequency Identification** (monthly, weekly, bi-weekly patterns)
- Requires 2+ occurrences for confident detection

### 📊 Comprehensive Dashboard
- Real-time spending statistics
- Interactive charts (Recharts)
- Subscription cost breakdown
- Potential savings calculator
- AI-generated spending insights

### 📁 Smart CSV Parser
- Intelligent column detection
- Multiple date format support
- Automatic categorization
- Transaction preview before upload

### 💳 Subscription Management
- Auto-detected recurring payments
- Monthly & yearly cost projections
- Duplicate subscription warnings
- Last detected date tracking

### 🎨 Premium UI/UX
- Modern fintech design (Stripe/Razorpay inspired)
- Dark/Light mode toggle
- Fully responsive (mobile + desktop)
- shadcn/ui components
- Smooth animations

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- shadcn/ui components
- Recharts for data visualization

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL)
- Row Level Security (RLS)

**Authentication:**
- Supabase Auth
- Email/Password authentication

**Libraries:**
- PapaParse (CSV parsing)
- date-fns (date manipulation)
- Lucide React (icons)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/shadow-spending-detector.git
   cd shadow-spending-detector
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up Supabase database:**
   
   Run the SQL script in Supabase SQL Editor:
   ```bash
   # Copy contents from /lib/setupDatabase.sql
   # Paste in Supabase Dashboard > SQL Editor
   # Click "Run"
   ```

5. **Run the development server:**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 📊 Algorithm Overview

### Recurring Payment Detection

```
1. Group Similar Transactions
   ↓ (Levenshtein distance matching)
   
2. Calculate Time Intervals
   ↓ (Days between occurrences)
   
3. Analyze Patterns
   ↓ (Monthly: ~30 days, Weekly: ~7 days)
   
4. Verify Consistency
   ↓ (Variance < 5 days)
   
5. Extract Subscription Info
   ↓ (Name, amount, frequency)
   
6. Calculate Savings
   ↓ (Duplicates, low-value payments)
```

**Success Criteria:**
- 2+ similar transactions
- Consistent time intervals
- Amount variance < 10%

## 📸 Screenshots

### Landing Page
![Landing Page](https://via.placeholder.com/800x500/8b5cf6/ffffff?text=Auth+Page)

### Dashboard
![Dashboard](https://via.placeholder.com/800x500/8b5cf6/ffffff?text=Dashboard)

### Subscriptions
![Subscriptions](https://via.placeholder.com/800x500/8b5cf6/ffffff?text=Subscriptions)

### Analytics
![Analytics](https://via.placeholder.com/800x500/8b5cf6/ffffff?text=Analytics)

## 🎯 Use Cases

- 💰 **Personal Finance**: Track and reduce monthly expenses
- 📊 **Budget Planning**: Understand spending patterns
- 🔍 **Subscription Audit**: Find forgotten subscriptions
- 💳 **Expense Analysis**: Categorize and analyze spending
- 📈 **Financial Goals**: Identify savings opportunities

## 🏗️ Project Structure

```
shadow-spending-detector/
├── app/
│   ├── page.js                    # Auth page
│   ├── dashboard/page.js          # Main dashboard
│   ├── api/[[...path]]/route.js  # API endpoints
│   ├── layout.js                  # Root layout
│   └── globals.css                # Global styles
├── lib/
│   ├── supabase.js                # Supabase client
│   ├── recurringDetection.js     # Core algorithm
│   ├── csvParser.js               # CSV parser
│   └── setupDatabase.sql          # Database schema
├── components/
│   ├── ui/                        # shadcn components
│   └── theme-provider.jsx         # Theme provider
└── public/
    └── ...                        # Static assets
```

## 🔐 Security

- ✅ Row Level Security (RLS) enabled
- ✅ User data isolation
- ✅ Secure authentication (Supabase Auth)
- ✅ Environment variables for sensitive data
- ✅ SQL injection prevention
- ✅ XSS protection

## 📈 Performance

- ⚡ Server-side rendering (SSR)
- 🎨 Optimized bundle size
- 📦 Code splitting
- 🖼️ Lazy loading
- 🚀 Fast page loads

## 🎓 What I Learned

- Implementing pattern recognition algorithms
- Working with time-series financial data
- Building secure authentication flows
- Database design with RLS policies
- CSV parsing and data transformation
- Creating responsive dashboards
- Integrating Supabase with Next.js
- Optimizing React performance

## 🚧 Future Enhancements

- [ ] Bank account integration (Plaid API)
- [ ] Email notifications for new subscriptions
- [ ] Budget tracking and alerts
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] Export to PDF
- [ ] Sharing insights
- [ ] AI-powered recommendations
- [ ] OCR for receipt scanning

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- GitHub: [@YourUsername](https://github.com/yourusername)
- Portfolio: [yourportfolio.com](https://yourportfolio.com)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/shadow-spending-detector&type=Date)](https://star-history.com/#yourusername/shadow-spending-detector&Date)

---

<p align="center">Made with ❤️ by Your Name</p>
<p align="center">
  <a href="https://spend-shadow.preview.emergentagent.com">Live Demo</a> •
  <a href="#-getting-started">Get Started</a> •
  <a href="#-use-cases">Use Cases</a>
</p>
