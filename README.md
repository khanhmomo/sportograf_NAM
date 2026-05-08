# Sportograf North America - Event Tool

A comprehensive web application for crew members to choose events and submit travel information, with an admin dashboard for data management.

## Features

- **Event Management**: Browse and register for available events
- **Travel Forms**: Submit travel information for events (flight, car, or bus/train)
- **Admin Dashboard**: Manage events, view statistics, and handle travel form data
- **Travel Form Export**: Export travel forms to Excel format
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Form Validation**: Comprehensive input validation with Zod
- **Database Integration**: MongoDB with custom connection handling
- **Authentication**: Custom JWT-based admin authentication

## Tech Stack

- **Frontend**: Next.js 16.2.6, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Custom JWT (jsonwebtoken)
- **Form Handling**: React Hook Form with Zod validation
- **Excel Export**: xlsx library
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local instance or MongoDB Atlas connection string)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/khanhmomo/sportograf_NAM.git
cd crew-events
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/crew-events
# or use MongoDB Atlas connection string
JWT_SECRET=your-secret-key-here
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
crew-events/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── admin/          # Admin dashboard
│   │   │   ├── events/     # Event management
│   │   │   ├── travel-forms/ # Travel form management
│   │   │   └── login/      # Admin login
│   │   ├── events/         # Event browsing
│   │   ├── travel/         # Travel form submission
│   │   └── api/            # API routes
│   │       ├── admin/      # Admin API endpoints
│   │       ├── events/     # Event API
│   │       └── travel/     # Travel form API
│   ├── components/         # Reusable React components
│   │   ├── AlertModal.tsx
│   │   ├── Header.tsx
│   │   ├── Toast.tsx
│   │   └── ToastContainer.tsx
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   │   ├── mongodb.ts      # MongoDB connection
│   │   └── shared-storage.ts
│   ├── models/             # TypeScript interfaces
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── scripts/                # Utility scripts
├── add-events.js           # Script to add events to database
├── migrate-events.js       # Script to migrate events
└── seed-events.js          # Script to seed events
```

## Database Schema

The application uses MongoDB with the following main collections:

- **events**: Available events for registration
  - Event title, location, date, time
  - Registration status
  - Event details

- **registrations**: User registrations for events
  - User information
  - Event reference
  - Registration timestamp
  - Admin notes

- **travel-forms**: Travel information submissions
  - Personal information (name, acronym, email, phone, gender)
  - Travel method (flight, car, bus/train)
  - Flight details (arrival/departure information)
  - Car details (driving from, expected miles)
  - Bus/train details (stations, dates, times)
  - Ticket cost (for flight/bus/train)
  - Accommodation requests (hotel nights)
  - Special requests
  - Car rental reservation (admin field)

## API Endpoints

### Events
- `GET /api/events` - List all active events
- `POST /api/events/register` - Register for event
- `POST /api/events/request` - Request event access

### Travel Forms
- `GET /api/travel` - Get user travel forms
- `POST /api/travel` - Submit travel form
- `DELETE /api/travel/clear` - Clear all travel forms

### Admin Authentication
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/auth/verify` - Verify admin session

### Admin Events
- `GET /api/admin/events` - Get all events (admin view)
- `POST /api/admin/events` - Create new event
- `GET /api/admin/events/[id]` - Get specific event
- `PATCH /api/admin/events/[id]` - Update event
- `DELETE /api/admin/events/[id]` - Delete event
- `POST /api/admin/migrate-events` - Migrate events from old format

### Admin Registrations
- `GET /api/admin/registrations/[id]` - Get registration details
- `PATCH /api/admin/registrations/[id]/note` - Update registration note
- `DELETE /api/admin/registrations/clear` - Clear all registrations
- `DELETE /api/admin/events/[id]/registrations/clear` - Clear event registrations

### Admin Travel Forms
- `GET /api/admin/travel-forms` - Get all travel forms
- `DELETE /api/admin/travel-forms/clear` - Clear all travel forms
- `DELETE /api/admin/travel-forms?id={id}` - Delete specific travel form
- `PATCH /api/admin/travel-forms/[id]` - Update travel form

### Admin Statistics
- `GET /api/admin/stats` - Dashboard statistics

## Development

### Database Management

- MongoDB connection is handled in `src/lib/mongodb.ts`
- The application uses a singleton pattern for MongoDB connections
- Ensure MongoDB is running before starting the application

### Adding New Features

1. Update TypeScript interfaces in `src/models/` or `src/types/`
2. Implement API routes in `src/app/api/`
3. Create UI components in `src/components/` or directly in pages
4. Add form validation using Zod schemas
5. Test thoroughly before deployment

### Utility Scripts

- `node add-events.js` - Add events to the database
- `node migrate-events.js` - Migrate events from old format
- `node seed-events.js` - Seed events for testing

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT tokens
4. Deploy automatically

### Environment Variables

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing

## Admin Access

- Default admin credentials can be set in the environment
- Admin login is required to access the dashboard
- JWT tokens are stored in HTTP-only cookies for security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## SPORTOGRAF

Photography for the love of sport
