# Quiz App

A trivia quiz application built with Express.js, TypeScript, MongoDB, and vanilla JavaScript web components.

## Live Demo

[Quiz App](https://quiz-app-ue83.onrender.com/)

## Features

### Core Features
- **Home Page** - Start a new quiz with category selection
- **Quiz Game** - Answer multiple-choice trivia questions
- **Results Page** - View your score after completing a quiz

### User Features
- **User Authentication** - Sign up and log in with username/password
- **User Profile** - View your play history and statistics
- **Leaderboard** - See the top 10 players and your ranking

### Extra Features
- **Category Selection** - Choose from various trivia categories
- **Question Count** - Select how many questions (5, 10, 15, or 20)
- **Replay** - Play again after finishing a quiz

## Tech Stack

- **Backend**: Express.js 5, TypeScript
- **Database**: MongoDB with session storage
- **Frontend**: Vanilla JavaScript (Web Components)
- **API**: Open Trivia Database (opentdb.com)
- **Auth**: bcrypt password hashing, express-session

## Setup

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- pnpm (or npm/yarn)

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/quiz-app
SESSION_SECRET=your-secret-key-here
PORT=3000
```

### Installation

```bash
# Install dependencies
pnpm install

# Run development server (with hot reload)
pnpm dev

# Run production server
pnpm start
```

The app will be available at `http://localhost:3000`

## Project Structure

```
quiz-app/
├── src/
│   ├── server.ts        # Express server entry point
│   ├── app.ts           # Express app configuration
│   ├── routes/          # API routes (auth, quiz, user)
│   ├── services/        # Business logic (auth, session, trivia)
│   ├── middleware/      # Auth middleware
│   ├── db/              # MongoDB client and collections
│   └── types.ts         # TypeScript interfaces
├── public/
│   ├── index.html       # Single page app entry
│   ├── css/             # Stylesheets
│   └── js/components/   # Web components
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Log in
- `POST /api/auth/logout` - Log out
- `GET /api/auth/me` - Get current user

### Quiz
- `GET /api/quiz/categories` - Get available categories
- `POST /api/quiz/start` - Start a new quiz session
- `POST /api/quiz/answer` - Submit an answer
- `GET /api/quiz/results/:sessionId` - Get quiz results
- `GET /api/quiz/leaderboard` - Get top 10 scores

### User
- `GET /api/user/profile` - Get user profile with play history

## Author

Solo project - Full Stack Development
