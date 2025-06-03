# AI-Powered Note Taking Application

A professional note-taking application with AI capabilities for enhanced productivity.

## Features

- Create, edit, and organize notes
- AI-powered features:
  - Smart summarization
  - Content suggestions
  - Automatic categorization
  - Sentiment analysis
- User authentication
- Cloud synchronization
- Responsive design for all devices

## Tech Stack

- **Frontend**: React.js, Material-UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI Integration**: OpenAI API
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```
3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the development servers:
   ```
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

## License

MIT
