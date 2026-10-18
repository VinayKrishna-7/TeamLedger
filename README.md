# TeamLedger

A minimal shared expense tracking and debt settlement web app for trips, flatmates, and group projects.

## Features

- **No Sign-up Needed**: Start tracking expenses immediately without login or passwords.
- **Accurate Expense Splitting**: Calculates exact shares in integer paise to avoid rounding discrepancies.
- **Settlement Suggestions**: Suggests minimal repayment transactions to settle group debts.
- **Clean UI with Dark Mode**: Fast, minimal interface with light and dark themes.

## Tech Stack

- **Frontend**: React, Vite, Plain CSS, Lucide React
- **Backend**: Node.js, Express, MongoDB (Mongoose)

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB running locally on `localhost:27017` (or MongoDB Atlas URI)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VinayKrishna-7/TeamLedger.git
   cd TeamLedger
   ```

2. Install dependencies:
   ```bash
   # Root & backend
   cd server
   npm install

   # Frontend
   cd ../client
   npm install
   ```

3. Configure Environment:
   In `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/teamledger
   CLIENT_URL=http://localhost:5173
   ```

### Running the App

Start the backend:
```bash
cd server
npm run dev
```

Start the frontend:
```bash
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

## Tests

Run backend tests:
```bash
cd server
npm test
```
