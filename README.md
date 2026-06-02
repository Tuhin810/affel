# Affiliate Marketing Backend

A Node.js and Express.js backend application for affiliate marketing.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/myogokuservices-source/Affiliate-marketing-backend.git
cd Affiliate-marketing-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```
PORT=3000
NODE_ENV=development
```

## Running the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Project Structure

```
Affiliate-marketing-backend/
├── server.js          # Main application entry point
├── package.json       # Project dependencies
├── .env               # Environment variables
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## License

ISC
