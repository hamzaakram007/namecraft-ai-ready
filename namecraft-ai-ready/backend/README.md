# NameCraft AI - Complete Backend System

A full-stack AI-powered business name generator with user authentication, premium features, and crypto payments.

## 🎯 What's Included

✅ **Backend Server** (Node.js + Express)
- User registration & login with JWT authentication
- SQLite database with complete schema
- Generation limit system (6/day free, unlimited premium)
- Save favorite names functionality
- Payment verification system
- API endpoints for all features

✅ **Frontend** (HTML5 + Vanilla JS)
- User authentication modal
- Real-time generation limit display
- AI name generation with Gemini API
- Save/like functionality
- Premium upgrade prompts
- USDT crypto payment integration
- Responsive design

✅ **Payment System**
- USDT BEP20 payment on BSC
- BscScan verification
- Automatic premium activation
- 1-year premium access

✅ **Documentation**
- Complete API reference
- Deployment guides
- Troubleshooting tips

## 📁 Project Structure

```
backend/
├── server.js              # Express server & routes
├── database.js            # SQLite setup & helpers
├── auth.js               # Authentication logic
├── payments.js           # Payment verification
├── package.json          # Dependencies
└── .env                  # Configuration

namecraft-ai-frontend.html  # Complete frontend with auth
```

## 🚀 Getting Started

### 1. Setup Backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:5000`

### 2. Configure .env

```
PORT=5000
JWT_SECRET=your_random_secret_string
GEMINI_API_KEY=AIzaSyALxU7nQiI74j07E40ZGfsfRv83wMg5nug
USDT_WALLET_ADDRESS=0xf540dc7a1ab8131ab986c7dcaf46c0622d2fa483
USDT_CONTRACT_ADDRESS=0x55d398326f99059ff775485246999027b3197955
BSCSCAN_API_KEY=your_bscscan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
DATABASE_URL=./database.db
FREE_GENERATION_LIMIT=6
FREE_GENERATION_RESET_DAYS=1
```

### 3. Open Frontend

Open `namecraft-ai-frontend.html` in your browser from the project root

## 📊 Features

### User Management
- Email/password registration
- Secure login with JWT tokens
- User profiles with premium status
- 30-day token expiration

### Name Generation
- **Free Tier**: 6 generations per day
- **Premium**: Unlimited generations
- Powered by Google Gemini AI
- Save unlimited favorites (premium)

### Payment Processing
- USDT crypto payments
- Automatic blockchain verification
- Instant premium activation
- Email-based bank transfers

### Data Management
- Generation history tracking
- Saved names collection
- Payment records
- Usage analytics ready

## 🔐 Security Features

- Password hashing with bcryptjs (salt = 10)
- JWT token authentication
- Parameterized SQL queries (no injection)
- Environment variable protection
- CORS restrictions
- Input validation
- Secure payment verification

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/user` - Get user info

### Generation
- `GET /api/generations/limit` - Check remaining uses
- `POST /api/generations/generate` - Generate names
- `GET /api/generations/history` - Get past generations

### Saved Names
- `POST /api/names/save` - Save favorite
- `GET /api/names/saved` - Get saved names
- `DELETE /api/names/saved/:id` - Delete saved name

### Payments
- `POST /api/payments/initiate` - Start payment
- `POST /api/payments/verify` - Verify USDT payment
- `GET /api/payments/status/:txHash` - Check status

## 💾 Database Schema

**Users** - Accounts, premium status, expiry dates
**Generations** - All AI generation requests & results
**GenerationLimits** - Track daily free usage
**Payments** - Payment records & verification
**SavedNames** - User's favorite names

## 🌐 Deployment Options

### Heroku
```bash
heroku create your-app-name
heroku config:set JWT_SECRET=xxx
git push heroku main
```

### Render
- Connect GitHub repo
- Add environment variables
- Auto-deploys on push

### DigitalOcean/AWS
- Use your preferred hosting
- Update API_URL in frontend
- Configure database for production

## 🔄 Usage Flow

1. User signs up/logs in
2. Enters business description
3. Backend checks generation limit
4. Gemini AI generates 6 names
5. Results displayed with save option
6. User can upgrade to premium
7. Premium activation via crypto payment
8. Unlimited access enabled

## 📈 Next Steps

- [ ] Add email verification
- [ ] Implement referral system
- [ ] Add name analytics
- [ ] Create admin dashboard
- [ ] Add more AI features
- [ ] Implement caching
- [ ] Add usage analytics
- [ ] Set up monitoring/alerts

## 🛠️ Tech Stack

**Backend**: Node.js, Express, SQLite, JWT, bcryptjs
**Frontend**: HTML5, Vanilla JavaScript, Web3.js
**AI**: Google Gemini 1.5 Flash
**Payments**: Ethereum, USDT, Etherscan API
**Hosting**: Docker-ready, supports Heroku/Render/AWS

## 📝 License

MIT License - Feel free to use and modify

## 💬 Support

For questions or issues, check:
1. `backend/DEPLOYMENT_GUIDE.md` - Detailed deployment
2. Error logs in server console
3. Browser console for frontend errors

## 🎉 Ready to Deploy!

Your complete backend system is ready. All you need to do:

1. **Install dependencies**: `npm install`
2. **Configure .env** with your API keys
3. **Start server**: `npm start`
4. **Open frontend** in browser
5. **Test registration & generation**
6. **Deploy to production**

---

**Made with ❤️ for entrepreneurs building amazing businesses**
