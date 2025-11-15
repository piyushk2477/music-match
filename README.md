# Music Match

Music Match is a social music platform that connects people through their musical tastes. Built with React, Node.js, and Spotify integration, it allows users to discover others with similar music preferences, compare tastes, and explore rankings.

## Features

- **Spotify Integration**: Authenticate with Spotify to access your music data
- **Music Discovery**: Find people with similar musical tastes
- **Taste Comparison**: Compare your music preferences with other users
- **Rankings**: View rankings of popular artists and songs
- **User Profiles**: Personalized profiles with favorite artists and songs
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 19 with Vite
- TailwindCSS for styling
- Framer Motion for animations
- React Router for navigation
- React Icons for UI icons

### Backend
- Node.js with Express
- MySQL database
- Spotify API integration
- Passport.js for authentication
- CORS-enabled API

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL database
- Spotify Developer Account

## Authors

| Name       | LinkedIn | GitHub |
|------------|----------|--------|
| **Prakash Swami**       | [LinkedIn](https://www.linkedin.com/in/prakashswami) | [GitHub](https://github.com/prakashswami) |
| **Author 2** | [LinkedIn](#) | [GitHub](#) |
| **Author 3** | [LinkedIn](#) | [GitHub](#) |
| **Author 4** | [LinkedIn](#) | [GitHub](#) |

## Installation

### Frontend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd music-match
```

2. Install frontend dependencies:
```bash
npm install
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SESSION_SECRET=your_session_secret
DATABASE_HOST=localhost
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_NAME=musicmatch
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Database Setup

1. Create a MySQL database named `musicmatch`
2. Run the database schema:
```sql
-- Execute the contents of backend/database.sql
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a separate terminal, start the frontend:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Mode

1. Build the frontend:
```bash
npm run build
```

2. Start the backend server:
```bash
cd backend
npm start
```

## API Endpoints

### Authentication
- `GET /api/auth/spotify` - Initiate Spotify OAuth
- `GET /callback` - Spotify OAuth callback
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout current user

### User Data
- `GET /api/user/favorites` - Get user's favorite artists and songs
- `POST /api/user/favorites/artist` - Add favorite artist
- `POST /api/user/favorites/song` - Add favorite song
- `GET /api/user/similarity` - Get user similarity scores
- `GET /api/users/all` - Get all users with favorites

### Public Data
- `GET /api/artists` - Get all artists
- `GET /api/songs` - Get all songs

### Utility
- `GET /api/health` - Health check endpoint
- `GET /api/test-db-connection` - Test database connection

## Project Structure

```
music-match/
├── backend/
│   ├── auth.js              # Authentication routes
│   ├── database.sql         # Database schema
│   ├── db.js                # Database connection
│   ├── server.js            # Main server file
│   ├── spotify-auth.js      # Spotify OAuth configuration
│   └── migrations/          # Database migration scripts
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page components
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
└── vite.config.js          # Vite configuration
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.

