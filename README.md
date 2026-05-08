# Sportograf North America - Event Tool

A comprehensive web application for crew members to choose events and submit travel information, with an admin dashboard for data management.

## Features

- **Event Management**: Browse and register for available events
- **Travel Forms**: Submit travel information for events
- **Admin Dashboard**: Manage events, view statistics, and handle data
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Form Validation**: Comprehensive input validation with error handling
- **Database Integration**: SQLite database with Prisma ORM

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (easily upgradeable to PostgreSQL)
- **Authentication**: NextAuth.js (configured)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
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

4. Initialize the database:
```bash
npx prisma migrate dev
npx prisma generate
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
│   │   ├── events/         # Event browsing
│   │   ├── travel/         # Travel forms
│   │   └── api/            # API routes
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript definitions
├── prisma/                 # Database schema and migrations
└── public/                 # Static assets
```

## Database Schema

The application uses the following main models:

- **User**: Crew members and admin users
- **Event**: Available events for registration
- **EventRegistration**: User registrations for events
- **TravelForm**: Travel information submissions

## API Endpoints

### Events
- `GET /api/events` - List all active events
- `POST /api/events` - Create new event (admin)
- `POST /api/events/register` - Register for event

### Travel Forms
- `GET /api/travel` - Get user travel forms
- `POST /api/travel` - Submit travel form

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/events` - All events (admin view)
- `PATCH /api/admin/events/[id]` - Update event
- `DELETE /api/admin/events/[id]` - Delete event

## Development

### Database Management

- View database: `npx prisma studio`
- Reset database: `npx prisma migrate reset`
- Generate client: `npx prisma generate`

### Adding New Features

1. Update database schema in `prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev --name <migration-name>`
3. Generate Prisma client: `npx prisma generate`
4. Implement API routes and UI components

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

Ensure the following environment variables are set:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
