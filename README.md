# 💰 Pocket Money - Personal Finance Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

A simple and efficient personal finance tracker to manage your expenses, income, and budget.

## ✨ Features

- 💸 Track expenses and income
- 📊 Category-based spending analysis
- 🎯 Budget goals and alerts
- 📈 Monthly/yearly reports
- 💾 Local data persistence
- 🔒 No external dependencies - your data stays private

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed

### Installation
```bash
# Clone the repository
git clone https://github.com/andreprimo71-maker/pocket-money.git

# Navigate to project
cd pocket-money

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
pocket-money/
├── src/
│   ├── index.js          # Entry point
│   ├── models/           # Data models
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   └── cli/              # Command-line interface
├── tests/                # Unit tests
├── data/                 # Local data storage (gitignored)
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run production build |
| `npm run dev` | Run with hot reload (nodemon) |
| `npm test` | Run unit tests |

## 🔐 Security

- No hardcoded secrets or API keys
- All data stored locally
- Environment variables for configuration (see `.env.example`)

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 👤 Author

**andreprimo71-maker**
- GitHub: [@andreprimo71-maker](https://github.com/andreprimo71-maker)