# GullyCricks 🏏

A real-time cricket scorecard application for managing local cricket tournaments. Built with a modern tech stack featuring real-time WebSocket updates, allowing multiple users to view and manage match scores simultaneously.

## Overview

GullyCricks is a full-stack application designed to digitize the experience of managing and following local cricket tournaments. Whether you're organizing a gully cricket tournament or just want to keep track of live scores, this application provides a real-time platform with instant score updates across all connected devices.

**Status:** Currently in development with core architecture in place.

---

## Features

### ✅ Implemented
- **Real-time Scorecard Updates** - WebSocket-based live score synchronization
- **Match Management** - Create and manage cricket matches
- **User Roles** - Admin and viewer roles for match participation
- **Dashboard Interface** - Next.js-based responsive UI for desktop and mobile
- **Match Joining** - Users can join matches using unique match codes
- **Score Tracking** - Real-time updates for runs, wickets, and match status
- **Ball-by-Ball History** - Over navigation with visual ball indicators (dot, runs, wicket, wide, no-ball)
- **Reconnect Support** - Auto rejoin to match room on socket reconnect
- **Admin-Only Scoring** - Server validates admin role before score updates

### 🔄 In Development
- Error handling layer for socket events
- Authentication & authorization for socket connections (beyond local visitorId)
- Rate limiting to prevent abuse
- Match history and statistics
- Advanced filtering and search

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js (v5)
- **Database:** MongoDB (Mongoose)
- **Real-time Communication:** Socket.IO
- **Logging:** Winston-based logger (dev/production modes)
- **Utilities:** Rate limiting, match code generation, score recalculation
- **Views:** EJS (lightweight server rendering)

### Frontend
- **Framework:** Next.js (v16)
- **Language:** TypeScript
- **UI Library:** React (v19)
- **Styling:** Tailwind CSS v4 + PostCSS
- **Real-time:** Socket.IO Client
- **Context API:** Global socket state management
- **Linting:** ESLint

---

## Project Structure

```
GullyCricks/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Express app configuration
│   │   ├── index.ts               # Server entry point
│   │   ├── config/
│   │   │   └── db.ts              # MongoDB connection
│   │   ├── controllers/           # Request handlers
│   │   │   ├── matchController.ts
│   │   │   └── userController.ts
│   │   ├── models/                # MongoDB schemas
│   │   │   ├── Match.ts
│   │   │   └── User.ts
│   │   ├── repositories/          # Data access layer
│   │   │   ├── matchRepository.ts
│   │   │   └── userRepository.ts
│   │   ├── services/              # Business logic
│   │   │   ├── matchService.ts
│   │   │   └── userService.ts
│   │   ├── socket/                # Real-time communication
│   │   │   ├── matchSocket.ts     # Main socket setup
│   │   │   ├── events/            # Event-specific logic
│   │   │   │   ├── createMatch.ts
│   │   │   │   ├── joinMatch.ts
│   │   │   │   ├── leaveMatch.ts
│   │   │   │   ├── reconnectRoom.ts
│   │   │   │   └── updateMatch.ts
│   │   │   ├── handlers/          # Connection lifecycle
│   │   │       ├── connection.ts
│   │   │       └── disconnect.ts
│   │   │   ├── Types/              # Socket-specific types
│   │   │   └── utils/
│   │   │       └── rateLimiter.ts
│   │   ├── routes/                # HTTP endpoints
│   │   │   ├── matchRoutes.ts
│   │   │   └── userRoutes.ts
│   │   ├── middlewares/           # Express middleware
│   │   ├── logger/                # Logging utilities
│   │   ├── types/                 # TypeScript definitions
│   │   └── utlis/                 # Additional utilities
│   │       ├── generateMatchCode.ts
│   │       └── recalculateScore.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── (entry)/           # Entry routes
│   │   │   │   └── page.tsx       # Home page
│   │   │   ├── (dashboard)/       # Dashboard routes
│   │   │   │   └── match/[id]/page.tsx
│   │   │   ├── ClientLayout.tsx   # Client-side wrapper
│   │   │   └── globals.css
│   │   ├── context/
│   │   │   └── SocketContext.tsx  # Global socket state
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   └── BallHistory.tsx
│   │   ├── lib/
│   │   │   └── apiClient.ts       # HTTP client utilities
│   │   └── ...
│   ├── public/                     # Static assets
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── postcss.config.mjs
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GullyCricks
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file with:
   # MONGO_URI=your_mongodb_connection_string
   # PORT=5000
   # NODE_ENV=development
   
   npm run dev    # Development mode with hot reload
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Create .env.local file with:
   # NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   
   npm run dev    # Development mode on port 3000
   ```

4. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

### Running Tests
```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

---

## Current Development Focus

### Critical Issues Being Addressed (May 27, 2026)

1. **Error Handling Layer** - Implementing centralized socket error handling
2. **Authentication & Authorization** - Hardening socket auth beyond local `visitorId`
3. **Rate Limiting** - Preventing abuse of socket events and API endpoints
4. **Input Validation** - Ensuring all data is validated before processing

See [SOCKET_STRUCTURE_REVIEW.md](./SOCKET_STRUCTURE_REVIEW.md) for detailed analysis and implementation roadmap.

---

## Architecture Highlights

### Real-time Architecture
- **WebSocket Events:** Separated by feature into individual files for maintainability
- **Connection Handlers:** Dedicated handlers for socket connection/disconnection lifecycle
- **Namespace Orchestrator:** `matchSocket.ts` registers events under `/matches`
- **Reconnect Flow:** Client auto-emits `reconnectRoom` on socket connect

### Data Layer
- **Repository Pattern:** Abstracted MongoDB operations for easier testing and maintenance
- **Service Layer:** Business logic separated from API handlers
- **Models:** Type-safe MongoDB schemas with TypeScript

### Client State Management
- **Socket Context:** Global socket instance available throughout the React app
- **Real-time Updates:** Components subscribe to socket events for automatic UI updates

---

## API Endpoints

### Match Routes
- `GET /api/matches` - List all matches
- `POST /api/matches` - Create a new match
- `GET /api/matches/:id` - Get match details
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match

### User Routes
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details

---

## Socket Events

Namespace: `/matches`

### Emitted by Server
- `userListUpdated` - Full user list after match creation
- `userJoined` - A new user joined the match
- `userLeft` - A user left the match
- `updatedScore` - Match score updated
- `matchStateUpdate` - Full match state on reconnect

### Received by Server
- `createMatch` - Create a new match
- `joinMatch` - Join a match by code
- `updateMatch` - Update score (admin only)
- `leaveMatch` - Leave a match
- `reconnectRoom` - Rejoin match room after reconnect

---

## Contributing

Guidelines for contributing to GullyCricks:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Follow TypeScript best practices and maintain type safety
3. Write descriptive commit messages
4. Test your changes locally before pushing
5. Create a pull request with a clear description

---

## Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Verify Node.js version (v18+)
- Clear `node_modules` and reinstall: `npm install`

### Socket connection issues
- Ensure backend is running on correct port
- Check `NEXT_PUBLIC_BACKEND_URL` in frontend `.env.local`
- Verify CORS settings in backend Socket.IO configuration

### Build errors
- Clear Next.js cache: `rm -rf .next`
- Rebuild TypeScript: `npm run build`

---

## Future Roadmap

- [ ] User authentication with JWT tokens
- [ ] Tournament bracket generation
- [ ] Match statistics and analytics
- [ ] Mobile app (React Native)
- [ ] Umpire interface for on-field scoring
- [ ] Commentary and live chat
- [ ] Match notifications and reminders
- [ ] Database optimization and indexing

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the [SOCKET_STRUCTURE_REVIEW.md](./SOCKET_STRUCTURE_REVIEW.md) for architectural details

---

**Happy Scoring! 🏏⚡**

Last Updated: May 27, 2026
