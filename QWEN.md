# Habit Tracker Project - QWEN.md

## Project Overview

This is an Agentic-AI based Habit Tracker application built with a MERN (MongoDB, Express, React/Next.js, Node.js) stack. The application leverages artificial intelligence to provide personalized habit recommendations and insights. The system maintains comprehensive user history in a Pinecone vector database for advanced analytics and AI-powered personalization.

### Architecture Components

**Frontend:**
- Next.js 16.0.3 (React framework)
- TypeScript for type safety
- Tailwind CSS for styling
- Built with modern React features and app router pattern

**Backend:**
- Node.js with Express.js framework
- TypeScript for type safety
- MongoDB for traditional document storage
- Pinecone for vector database storage of user behavior history
- Environment configuration via .env files

### Project Structure

```
D:\Habit_tracker\
├── backend/           # Node.js + Express.js backend
│   ├── controllers/   # Request handling logic
│   ├── db/           # Database connection logic
│   ├── middlewares/  # Express middlewares
│   ├── models/       # Mongoose models
│   ├── types/        # TypeScript type definitions
│   ├── index.mts     # Main server entry point
│   └── package.json  # Backend dependencies
├── frontend/         # Next.js frontend
│   ├── app/          # Next.js 13+ app router structure
│   ├── components/   # React components
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
└── documentation/    # Project documentation
    └── prd.md        # Product Requirements Document
```

## Development Setup

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. Visit `http://localhost:3000` to view the application

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```
   PORT=2500
   MONGO_URI=your_mongodb_connection_string
   PINECONE_API_KEY=your_pinecone_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev        # For TypeScript watching
   # or
   npm run runner     # For running with nodemon
   # or
   npm start          # For production build
   ```

5. The backend server will run on `http://localhost:2500`

## Key Technologies and Libraries

### Backend Technologies:
- **Express.js**: Web framework for Node.js
- **Mongoose**: MongoDB object modeling for Node.js
- **TypeScript**: Type-safe JavaScript compilation
- **Chalk**: Terminal string styling
- **CORS**: Cross-Origin Resource Sharing middleware
- **Dotenv**: Environment variable management

### Frontend Technologies:
- **Next.js 16**: React framework with app router
- **React 19**: User interface library
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript compilation

## Project Conventions

### Code Style
- TypeScript is used for both frontend and backend
- Modern ES modules syntax
- Asynchronous operations with async/await
- Consistent naming conventions (camelCase for variables/functions)
- Kebab-case for file names

### API Design
- RESTful API design principles
- JSON for data exchange
- HTTP status codes for error handling
- Environment configuration for different deployment environments

### Database Structure
- MongoDB for user accounts, habits, and general data
- Pinecone vector database for AI analysis and historical behavior patterns
- Mongoose schemas for MongoDB data validation

## Deployment

### Frontend
- Build command: `npm run build`
- Start command: `npm run start`
- Optimized for deployment on Vercel (with vercel.json in backend)

### Backend
- Expects environment variables for configuration
- Designed for cloud deployment with external MongoDB and Pinecone services

## AI and Pinecone Integration

The application incorporates an Agentic AI system that:
- Learns from user behavior patterns
- Stores comprehensive history in Pinecone vector database
- Provides personalized habit recommendations
- Analyzes user behavior trends using vector similarity
- Offers predictive analytics for habit success

Pinecone is used to:
- Store behavioral embeddings for advanced pattern recognition
- Enable semantic search of user's habit history
- Perform similarity matching for recommendation algorithms
- Maintain long-term user preference storage

## Key Files and Configuration

### Backend Configuration:
- `index.mts`: Main Express server entry point
- `db/connection/db.ts`: MongoDB connection logic
- `package.json`: Backend dependencies and scripts
- `.env`: Environment variables (not committed to version control)

### Frontend Configuration:
- `app/page.tsx`: Main page component
- `app/layout.tsx`: Root layout component
- `app/globals.css`: Global styles
- `next.config.ts`: Next.js configuration
- `package.json`: Frontend dependencies and scripts

## Development Scripts

### Frontend Scripts:
- `dev`: Start development server
- `build`: Create production build
- `start`: Start production server
- `lint`: Run ESLint

### Backend Scripts:
- `dev`: Watch TypeScript files for changes
- `runner`: Run with nodemon for development
- `start`: Run production build
- `test`: Placeholder for tests

## Next Steps

1. Implement API endpoints for user authentication
2. Develop the core habit tracking functionality
3. Integrate Pinecone for AI-powered analysis
4. Build the frontend components for habit management
5. Implement the Agentic AI recommendation system
6. Connect frontend and backend with API calls
7. Add comprehensive testing

## Documentation

- Product Requirements Document: `documentation/prd.md`
- Contains detailed specifications for AI features and Pinecone integration
- Implementation phases and success metrics included

This project represents a modern approach to habit tracking with AI integration, providing users with intelligent insights and personalized recommendations based on their behavior patterns and historical data stored in Pinecone.