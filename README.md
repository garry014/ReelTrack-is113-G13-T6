# Express/EJS Web Application



## Features
- **User Authentication**: Securely manage user access through login, and session-based logout functionality.
- **User Profile**: Access and manage personal account details and view a history of your activities within the platform.
- **Movie Management**: Browse a comprehensive catalog of movies, view detailed information, and perform administrative CRUD operations.
- **Movie Reviews**: Share your cinematic experiences by creating, editing, and deleting star ratings and text-based reviews.
- **Discussion Comments**: Engage with other users by posting, replying to, and managing comments on specific movie pages.
- **Personal Watchlist**: Organize your viewing habits by adding movies to a custom list and tracking their status (e.g., "Watching" or "Watched").
- **Genre Categorization**: Explore movies organized by specific genres, managed through an administrative interface.

## Tech Stack
- Frontend: EJS, CSS
- Backend: Node.js, Express
- Database: MongoDB, Mongoose

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment**:
   Setup your environment variables .env in the root directory.

3. **Run the app**:
   ```bash
   node server.js
   ```
   Visit http://localhost:5000

## Test Users Login Credentials
**Admin**
For security reasons, admin role can only be manually changed in the database.
- Email: admin@test.com
- Password: password

**User**
Account 1
- Email: user1@test.com
- Password: password

Account 2
- Email: user2@test.com
- Password: password

## AI Declaration
This project was created with the assistance of LLM. LLM was used to ideate project ideas, generate the frontend designs, README.md, and some of the initial setup of the file structure.