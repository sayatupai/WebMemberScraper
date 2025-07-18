# Overview

This is a full-stack web application built with modern TypeScript, focusing on Telegram group management and data scraping. The application is named "Soxmed Ranger" and provides capabilities for authenticating with Telegram, scraping group data, analyzing member information, and exporting results.

The project follows a monorepo structure with clear separation between client (React frontend), server (Express backend), and shared code. It's designed to run on Replit with PostgreSQL as the database, using Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and build processes
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom space-themed design
- **State Management**: TanStack Query for server state, React hooks for local state
- **Real-time Communication**: WebSocket connection for live updates
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server
- **Real-time**: WebSocket Server (ws library) for bidirectional communication
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Database**: PostgreSQL with Drizzle ORM
- **Build**: ESBuild for production bundling

### Database Schema
- **Users**: Basic user authentication
- **Telegram Sessions**: Store Telegram session data for persistence
- **Scraped Groups**: Telegram group metadata and statistics
- **Scraped Members**: Individual member data with privacy analysis

## Key Components

### Authentication System
- Multi-step Telegram authentication flow (phone → code → 2FA if needed)
- Session persistence using PostgreSQL storage
- WebSocket-based real-time authentication status updates

### Telegram Integration
- Custom TelegramService for handling Telegram API operations
- Support for group discovery, member scraping, and privacy analysis
- Configurable scraping modes (standard, hidden, all members)
- Rate limiting and privacy bypass capabilities

### Data Analysis
- Member visibility analysis (public vs hidden profiles)
- Real-time statistics and progress tracking
- Export capabilities (CSV, JSON)
- Interactive charts using Chart.js

### Real-time Features
- WebSocket connection for live updates during scraping
- Progress tracking with visual indicators
- Real-time authentication flow feedback
- Live data export and member count updates

## Data Flow

1. **Authentication Flow**: Client initiates phone-based login → Server communicates with Telegram API → Real-time status updates via WebSocket → Session stored in PostgreSQL
2. **Group Discovery**: User searches for groups → Server queries Telegram API → Results stored and displayed with member counts
3. **Member Scraping**: User configures scraping parameters → Server iterates through group members → Real-time progress updates → Data stored in PostgreSQL → Live analytics updates
4. **Data Export**: User requests export → Server formats data → Download provided to client

## External Dependencies

### Core Dependencies
- **Telegram API**: Uses @neondatabase/serverless for Telegram operations
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **UI Components**: Extensive use of Radix UI primitives via shadcn/ui
- **Charts**: Chart.js for data visualization
- **Date Handling**: date-fns for timestamp formatting

### Development Tools
- **Vite**: Development server and build tool with React plugin
- **TypeScript**: Full type safety across the stack
- **Tailwind CSS**: Utility-first styling with custom space theme
- **ESLint/Prettier**: Code formatting and linting (implied)

### External Services
- **Neon Database**: PostgreSQL hosting (indicated by @neondatabase/serverless)
- **Replit Integration**: Special development plugins and runtime error handling

## Deployment Strategy

### Development Environment
- Vite development server for frontend hot reloading
- Express server with TypeScript compilation via tsx
- Replit-specific plugins for development experience
- WebSocket server runs alongside HTTP server

### Production Build
- Frontend: Vite builds to `dist/public` directory
- Backend: ESBuild bundles server code to `dist/index.js`
- Static file serving from Express in production
- Database migrations handled via Drizzle Kit

### Environment Configuration
- Database URL required for PostgreSQL connection
- Telegram API credentials needed for functionality
- Session configuration for user persistence
- WebSocket configuration for real-time features

### Key Scripts
- `dev`: Development mode with tsx for TypeScript execution
- `build`: Production build for both frontend and backend
- `start`: Production server execution
- `db:push`: Database schema updates via Drizzle