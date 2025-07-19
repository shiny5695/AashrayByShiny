# आश्रय (Aashray) - Senior Citizen Service Platform
*शाइनी द्वारा*

A comprehensive service booking platform designed specifically for senior citizens in India, featuring elder-friendly UI and bilingual support (Hindi/English).

## 🌟 Features

### Core Services
- **नर्स सेवा (Nurse Services)** - Healthcare assistance and medication support
- **इलेक्ट्रीशियन (Electrician)** - Electrical repairs and installations
- **प्लंबर (Plumber)** - Plumbing and water-related services
- **ब्यूटीशियन (Beautician)** - Grooming and beauty services
- **कैब ड्राइवर (Cab Driver)** - Safe transportation services

### Elder-Friendly Design
- Large, readable fonts and high-contrast colors
- Simple navigation with Hindi language support
- Accessible UI components optimized for seniors
- Clear, intuitive booking flow

### Advanced Features
- **Emergency SOS System** - Quick access to emergency contacts
- **Relative Account Linking** - Family members can book services on behalf of seniors
- **SMS Notifications** - Booking confirmations and updates
- **Rating & Review System** - Service quality feedback
- **Profile Management** - Personal information and emergency contacts

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** with shadcn/ui components
- **Wouter** for lightweight routing
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** with Drizzle ORM
- **Replit Auth** with OpenID Connect
- **Express Sessions** with PostgreSQL storage

### Database
- **PostgreSQL** (Neon serverless)
- **Drizzle ORM** for type-safe queries
- **Session management** with connect-pg-simple

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database
- Replit account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd aashray
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy and configure your environment variables
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
REPL_ID=your_replit_app_id
REPLIT_DOMAINS=your_domain.replit.app
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   ├── db.ts            # Database connection
│   └── replitAuth.ts    # Authentication setup
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema and types
└── README.md
```

## 🗄 Database Schema

### Core Tables
- **users** - User profiles and authentication
- **service_providers** - Professional service providers
- **bookings** - Service appointments and scheduling
- **reviews** - Ratings and feedback
- **relatives** - Account linking for family members
- **emergency_contacts** - Emergency contact management
- **sessions** - User session storage

## 🔒 Authentication

The platform uses Replit Auth with OpenID Connect for secure authentication:
- Session-based authentication with PostgreSQL storage
- Support for senior citizen and relative account types
- Automatic user profile creation and management

## 🌐 API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `PUT /api/auth/user` - Update user profile
- `GET /api/login` - Initiate login
- `GET /api/logout` - User logout

### Services
- `GET /api/service-providers` - List service providers
- `GET /api/service-providers/:id` - Get provider details
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user bookings

### Emergency
- `POST /api/emergency/sos` - Send emergency alert
- `POST /api/emergency-contacts` - Add emergency contact

## 🎨 Design Philosophy

### Elder-Friendly UI Principles
- **Large Text**: Base font size of 18px with increased line height
- **High Contrast**: Enhanced color contrast for better visibility
- **Simple Navigation**: Intuitive menu structure with clear labels
- **Touch-Friendly**: Large buttons (minimum 48px height) for easy interaction
- **Error Prevention**: Clear validation messages and confirmations

### Accessibility Features
- Focus indicators with 3px outline
- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatible components

## 🚨 Emergency Features

The SOS system provides immediate assistance:
- One-click emergency alert button
- Automatic SMS notifications to all emergency contacts
- Clear confirmation messages
- Integration with user's emergency contact list

## 👥 Multi-User Support

### Account Types
- **Senior Citizens**: Primary users who book services
- **Relatives**: Family members who can book on behalf of seniors
- **Service Providers**: Professionals offering services

### Relative Features
- Account linking with permission management
- Booking on behalf of senior citizens
- Emergency contact access

## 📱 SMS Integration

Mock SMS implementation for:
- Booking confirmations
- Service provider notifications
- Emergency alerts
- Status updates

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

### Code Style
- TypeScript with strict type checking
- ESLint and Prettier for code formatting
- Functional components with hooks
- Type-safe database queries with Drizzle

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is built for senior citizen welfare and community service.

## 🙏 Acknowledgments

- Built with ❤️ for senior citizens in India
- Designed for accessibility and ease of use
- Community-focused service platform

---

**आश्रय - आपकी सेवा में, आपके घर पर**
*शाइनी द्वारा*