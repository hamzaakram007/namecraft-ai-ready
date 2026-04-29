# 🚀 Deploy NameCraft AI to Render.com (FREE)

## Step 1: Create GitHub Repository

**1. Go to GitHub.com**
- Sign up/login to GitHub

**2. Create New Repository**
- Click "New repository"
- Name: `namecraft-ai-backend`
- Make it **Public**
- Click "Create repository"

**3. Upload Your Files**
- Click "uploading an existing file"
- Drag and drop ALL files from your `backend` folder
- Click "Commit changes"

## Step 2: Deploy to Render.com

**1. Go to Render.com**
- Visit: https://render.com
- Sign up with GitHub account

**2. Create New Web Service**
- Click "New" → "Web Service"
- Connect your GitHub account
- Find your `namecraft-ai-backend` repository
- Click "Connect"

**3. Configure Deployment**
- **Name**: `namecraft-backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: **Free** (750 hours/month)

**4. Environment Variables**
Add these in the "Environment" section:

```
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
GEMINI_API_KEY=AIzaSyALxU7nQiI74j07E40ZGfsfRv83wMg5nug
USDT_WALLET_ADDRESS=0xf540dc7a1ab8131ab986c7dcaf46c0622d2fa483
USDT_CONTRACT_ADDRESS=0x55d398326f99059ff775485246999027b3197955
BSCSCAN_API_KEY=YourBscScanApiKey
ETHERSCAN_API_KEY=YourEtherscanApiKey
DATABASE_URL=./database.db
FREE_GENERATION_LIMIT=6
FREE_GENERATION_RESET_DAYS=1
```

**5. Click "Create Web Service"**

## Step 3: Get Your API URL

After deployment (takes 2-5 minutes), you'll get a URL like:
```
https://namecraft-backend.onrender.com
```

## Step 4: Update Frontend

**1. Open `namecraft-ai-frontend.html`**

**2. Find this line:**
```javascript
const API_URL = 'https://namecraft-backend.onrender.com/api';
```

**3. Replace with your actual URL:**
```javascript
const API_URL = 'https://YOUR-APP-NAME.onrender.com/api';
```

## Step 5: Deploy Frontend (Optional)

For frontend, you can:
- Host on GitHub Pages (free)
- Use Netlify (free)
- Use Vercel (free)
- Or just keep it as a downloadable HTML file

## Step 6: Test Your Deployment

**1. Visit your Render URL:**
```
https://namecraft-backend.onrender.com
```

**2. Test API endpoints:**
- Visit: `https://namecraft-backend.onrender.com/api/auth/user` (should return auth error)

**3. Open your HTML file and test registration**

## Important Notes

### Free Tier Limits
- **750 hours/month** (about 31 days)
- **750 GB-bandwidth/month**
- **Auto-sleep** after 15 minutes of inactivity
- **No custom domains** (but you can use the .onrender.com URL)

### Database
- SQLite works fine on Render
- Data persists between deployments
- Backups are your responsibility

### Security
- Change the `JWT_SECRET` to a random string
- Get your own BscScan API key
- Update wallet address to your real USDT BEP20 address

### Costs
- **Free forever** if you stay under limits
- Only pay if you exceed free tier

## Troubleshooting

### Build Fails
- Check the build logs in Render dashboard
- Make sure all dependencies are in package.json

### API Not Working
- Check environment variables are set correctly
- Verify your API keys are valid

### Database Issues
- SQLite file is created on first run
- Data persists between deployments

## Need Help?

If deployment fails:
1. Check Render build logs
2. Share any error messages
3. I'll help you fix them!

## Your URLs After Deployment

- **Backend API**: `https://namecraft-backend.onrender.com`
- **Frontend**: Download and open `namecraft-ai-frontend.html`

**Ready to deploy?** Follow these steps and let me know if you need help! 🚀
```

### 3. Get Required API Keys

#### Etherscan API Key (for USDT payment verification)
1. Go to https://etherscan.io/
2. Sign up and verify email
3. Go to Account → API Keys
4. Create a free API key
5. Add to `.env` as `ETHERSCAN_API_KEY`

## 🔑 API Endpoints

### Authentication

**Register**
```
POST /api/auth/register
Body: { email, password, name }
Response: { userId, token }
```

**Login**
```
POST /api/auth/login
Body: { email, password }
Response: { userId, token }
```

**Get User Info**
```
GET /api/auth/user
Headers: Authorization: Bearer {token}
Response: { id, email, name, isPremium, premiumExpiresAt }
```

### Name Generation

**Check Generation Limit**
```
GET /api/generations/limit
Headers: Authorization: Bearer {token}
Response: { limit, remaining, isPremium }
```

**Generate Names**
```
POST /api/generations/generate
Headers: Authorization: Bearer {token}
Body: { businessDesc, industry, vibe, audience }
Response: { names: [...] }
```

**Get History**
```
GET /api/generations/history
Headers: Authorization: Bearer {token}
Response: [...]
```

### Save Names

**Save Name**
```
POST /api/names/save
Headers: Authorization: Bearer {token}
Body: { name, tagline, why, notes }
Response: { success: true }
```

**Get Saved Names**
```
GET /api/names/saved
Headers: Authorization: Bearer {token}
Response: [...]
```

**Delete Saved Name**
```
DELETE /api/names/saved/:id
Headers: Authorization: Bearer {token}
Response: { success: true }
```

### Payments

**Initiate Payment**
```
POST /api/payments/initiate
Headers: Authorization: Bearer {token}
Body: { paymentMethod, amount, paymentType }
Response: { paymentId, walletAddress, message }
```

**Verify Payment & Activate Premium**
```
POST /api/payments/verify
Headers: Authorization: Bearer {token}
Body: { txHash, paymentId }
Response: { success: true }
```

**Check Payment Status**
```
GET /api/payments/status/:txHash
Headers: Authorization: Bearer {token}
Response: { status, amount, ... }
```

## 📊 Database Schema

### Users Table
- id (PK)
- email (UNIQUE)
- password (hashed)
- name
- isPremium (boolean)
- premiumExpiresAt (datetime)
- createdAt
- updatedAt

### Generations Table
- id (PK)
- userId (FK)
- businessDesc
- industry
- vibe
- audience
- names (JSON)
- createdAt

### GenerationLimits Table
- id (PK)
- userId (FK, UNIQUE)
- generationsToday (counter)
- lastResetDate (date)

### Payments Table
- id (PK)
- userId (FK)
- paymentMethod (USDT, PayPal, etc)
- amount
- currency
- transactionHash (UNIQUE)
- status (pending, confirmed, failed)
- paymentType (Pro, Agency)
- createdAt
- confirmedAt

### SavedNames Table
- id (PK)
- userId (FK)
- name
- tagline
- why
- notes
- createdAt

## 🎯 Features Implemented

### Free Users
- ✅ 6 name generations per day
- ✅ View generation history
- ✅ Save favorite names (5 max)
- ✅ Daily limit resets at UTC midnight

### Premium Users
- ✅ Unlimited name generation
- ✅ Full generation history
- ✅ Unlimited saved names
- ✅ Priority support
- ✅ Remove branding option
- ✅ 1-year premium access

### Premium Upgrade Options
- USDT Payment (Crypto)
- PayPal/Bank Transfer (Email-based)
- $9 for Pro
- $29 for Agency

## 🔐 Security Best Practices

1. **JWT Tokens**: 30-day expiration
2. **Password Hashing**: bcryptjs with salt rounds = 10
3. **Environment Variables**: Never commit `.env` file
4. **CORS**: Restricted to frontend domain
5. **Input Validation**: All inputs validated server-side
6. **SQL Injection Prevention**: Using parameterized queries

## 📦 Deployment

### Production Checklist

```bash
# 1. Update .env for production
NODE_ENV=production
JWT_SECRET=generate_a_strong_random_string

# 2. Install production dependencies only
npm install --production

# 3. Change database to PostgreSQL (recommended for production)
# Update database.js to use pg instead of sqlite3

# 4. Set up SSL/HTTPS
# Use nginx or node-ssl

# 5. Deploy to hosting
# Options: Heroku, AWS, DigitalOcean, Render, Railway
```

### Deploy to Render (Free)

1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect GitHub repo
5. Set environment variables
6. Deploy

### Deploy to Heroku (Paid)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create namecraft-ai-backend

# Add environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set GEMINI_API_KEY=your_key

# Deploy
git push heroku main
```

## 🐛 Troubleshooting

**Port Already in Use**
```bash
# Find process on port 5000
netstat -tulpn | grep :5000

# Kill process
kill -9 PID
```

**Database Locked**
```bash
# Delete database.db and restart
rm database.db
npm start
```

**CORS Errors**
```bash
# Update CORS settings in server.js
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

**Payment Verification Not Working**
```bash
# Check Etherscan API key
# Verify transaction hash is valid
# Check if transaction is confirmed on blockchain
```

## 📞 Support

For issues:
1. Check error logs in server console
2. Verify `.env` variables are set correctly
3. Check database connectivity
4. Verify API keys are valid

## 📈 Next Steps

1. Deploy backend to production server
2. Update frontend to use production API URL
3. Set up custom domain with SSL
4. Configure email notifications for payments
5. Add analytics/dashboards
6. Implement referral system
7. Add advanced AI features

---

**Built with:** Node.js, Express, SQLite, JWT, bcryptjs, Gemini AI
