# Overview

This is a full-stack web application built for senior citizens in India, providing an on-demand service platform called "आश्रय" (Aashray). The application connects senior citizens with various service providers like nurses, electricians, plumbers, beauticians, and cab drivers. It features a bilingual interface (Hindi/English) with elder-friendly design principles, emergency SOS functionality, and relative account linking for family members to help manage bookings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with a clear separation between client and server components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **Styling**: Custom CSS variables for elder-friendly high-contrast design

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Database**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions stored in PostgreSQL

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **User Management**: Mandatory user storage interface for Replit Auth compatibility
- **Account Types**: Support for senior citizens and relative accounts with different permissions

### Database Schema
- **Users**: Core user information with profile data and account types
- **Service Providers**: Professional service provider profiles with ratings and availability
- **Bookings**: Service booking management with status tracking
- **Reviews**: Rating and feedback system for service quality
- **Relatives**: Account linking system for family member access
- **Emergency Contacts**: Emergency contact management for SOS functionality
- **Sessions**: Secure session storage for authentication

### Service Management
- **Service Categories**: Nurse, Electrician, Plumber, Beautician, Cab Driver
- **Provider Discovery**: Location and service type based filtering
- **Booking System**: Comprehensive booking flow with scheduling and special instructions
- **Review System**: Post-service rating and feedback collection

### User Interface Components
- **Elder-Friendly Design**: Large text, high contrast colors, simplified navigation
- **Bilingual Support**: Hindi/English interface with easy language switching
- **Emergency Features**: Prominent SOS button with emergency contact notification
- **Responsive Design**: Mobile-first approach with accessible components

## Data Flow

### Authentication Flow
1. User accesses application through Replit Auth
2. OpenID Connect handles authentication with Replit's identity provider
3. User session established in PostgreSQL with secure cookie
4. User profile created/updated in users table
5. Frontend receives authenticated user context

### Service Booking Flow
1. User browses available service categories
2. Service providers filtered by location and type
3. User selects provider and fills booking form
4. Booking created with pending status
5. Provider accepts/rejects booking
6. Service completion triggers review workflow

### Emergency System Flow
1. User triggers SOS button
2. System retrieves user's emergency contacts
3. Notifications sent to all emergency contacts
4. Confirmation message displayed to user

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: WebSocket-based connection pool for serverless environments

### Authentication
- **Replit Auth**: OAuth 2.0/OpenID Connect identity provider
- **Session Storage**: PostgreSQL-based persistent session management

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Server state management and caching
- **Wouter**: Lightweight routing solution

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Development server and build tool with HMR
- **Drizzle**: Type-safe ORM with PostgreSQL support
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React application to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations manage schema changes

### Environment Configuration
- **Development**: Local development with Vite dev server proxy
- **Production**: Express serves static files and API routes
- **Database**: Environment-based DATABASE_URL configuration

### Asset Management
- **Static Assets**: Served through Express in production
- **Client Routing**: SPA routing handled by Wouter with fallback support
- **API Routes**: RESTful endpoints under `/api` prefix

### Scaling Considerations
- **Database**: Serverless PostgreSQL scales automatically with Neon
- **Session Storage**: PostgreSQL sessions support horizontal scaling
- **Static Assets**: CDN-ready static file serving
- **API**: Stateless Express server enables easy horizontal scaling