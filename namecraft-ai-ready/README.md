# NameCraft AI

This repository contains the clean deployable NameCraft AI project.

## Structure

```
namecraft-ai-ready/
├── backend/                      # Node.js backend server
│   ├── server.js
│   ├── database.js
│   ├── auth.js
│   ├── payments.js
│   ├── package.json
│   ├── .env                      # local development config (not committed)
│   ├── README.md
│   └── DEPLOYMENT_GUIDE.md
├── namecraft-ai-frontend.html    # Frontend app for the backend API
├── .gitignore
└── render.yaml                   # Render.com deployment config
```

## Run Locally

1. Open `namecraft-ai-ready/backend`
2. Install dependencies:

```bash
npm install
```

3. Create or update `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_random_secret_string
GEMINI_API_KEY=your_gemini_api_key
USDT_WALLET_ADDRESS=0xf540dc7a1ab8131ab986c7dcaf46c0622d2fa483
USDT_CONTRACT_ADDRESS=0x55d398326f99059ff775485246999027b3197955
BSCSCAN_API_KEY=your_bscscan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
DATABASE_URL=./database.db
FREE_GENERATION_LIMIT=6
FREE_GENERATION_RESET_DAYS=1
```

4. Start the backend:

```bash
npm start
```

5. Open `namecraft-ai-frontend.html` in your browser.

## Deploy to Render.com

1. Push this repository to GitHub.
2. Create a new Web Service on Render.
3. Connect the repo.
4. Use these settings:
   - Runtime: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
5. Add environment variables from `backend/.env`.

## Notes

- Frontend uses `http://localhost:5000/api` by default for local testing.
- When deployed, update `API_URL` in the frontend to your Render URL.
- The backend now verifies USDT BEP20 payments on BSC using BscScan.
- `backend/.env` should never be committed to source control.
