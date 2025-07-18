# Overview

This is a full-stack web application built with modern TypeScript, focusing on Telegram group management and advanced data scraping. The application is named "Telegram Soxmed Ranger" and provides enterprise-level capabilities for authenticating with Telegram, discovering groups, scraping member data with privacy bypass techniques, AI-powered analytics, proxy management, stealth mode operations, and comprehensive data export functionality.

The project follows a monorepo structure with clear separation between client (React frontend), server (Express backend), and shared code. It's designed to run on Replit with PostgreSQL as the database, using Drizzle ORM for database operations. The application features a space-themed 3D interface with advanced glassmorphism design and multiple specialized fonts for a professional appearance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and build processes
- **UI Framework**: shadcn/ui components built on Radix UI primitives with advanced Tabs interface
- **Styling**: Tailwind CSS with custom space-themed design, glassmorphism effects, and neon animations
- **Typography**: Multiple Google Fonts (Orbitron, Exo 2, Space Grotesk) for futuristic appearance
- **State Management**: TanStack Query for server state, React hooks for local state
- **Real-time Communication**: WebSocket connection for live updates and streaming data
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Custom CSS animations including floating, matrix effects, and neon glow
- **Logo Integration**: Custom logo display with glow effects and floating animation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server
- **Real-time**: WebSocket Server (ws library) for bidirectional communication
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Database**: PostgreSQL with Drizzle ORM
- **Build**: ESBuild for production bundling

### Database Schema
- **Users**: Basic user authentication and session management
- **Telegram Sessions**: Store Telegram session data for persistence and auto-login
- **Scraped Groups**: Telegram group metadata, statistics, and member counts
- **Scraped Members**: Individual member data with privacy analysis, risk scoring, and intelligence
- **Proxy Configs**: Proxy server configurations for IP rotation and anonymity
- **Stealth Settings**: Advanced anti-detection and privacy bypass configurations

## Key Components

### Authentication System
- Multi-step Telegram authentication flow (phone → code → 2FA if needed)
- Session persistence using PostgreSQL storage
- WebSocket-based real-time authentication status updates
- Custom logo integration with floating animations

### Advanced Telegram Integration
- Custom TelegramService for handling Telegram API operations
- Support for group discovery, member scraping, and privacy analysis
- Multiple scraping modes (standard, hidden, all members, recent activity)
- Advanced rate limiting and privacy bypass capabilities
- Stealth mode with anti-detection algorithms
- Proxy rotation and IP masking

### AI-Powered Analytics
- Member visibility analysis (public vs hidden profiles)
- Risk assessment and anomaly detection
- Privacy scoring and behavioral analysis
- Real-time statistics and progress tracking
- Advanced search and filtering capabilities
- Export capabilities (CSV, JSON, detailed reports)
- Interactive charts using Chart.js

### Stealth Mode Operations
- Anti-detection algorithms and techniques
- User agent rotation and header spoofing
- Random delays and human-like behavior simulation
- Request throttling and fingerprinting protection
- Configurable stealth levels and timing patterns

### Proxy Management System
- Multiple proxy protocol support (HTTP, SOCKS4, SOCKS5)
- Automatic proxy rotation and health monitoring
- Latency testing and geographic distribution
- Authentication support for premium proxies
- Real-time status monitoring and failover

### Advanced UI Components
- Tabbed interface with specialized sections
- Space-themed 3D animations and glassmorphism design
- Real-time progress indicators and status displays
- Interactive member intelligence tables
- Advanced filtering and search capabilities

### Real-time Features
- WebSocket connection for live updates during scraping
- Progress tracking with visual indicators
- Real-time authentication flow feedback
- Live data export and member count updates
- Proxy status monitoring and stealth mode feedback
- AI analysis progress and anomaly alerts

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