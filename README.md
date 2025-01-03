I'll create an updated README.md file with more specific information about our current setup and implementation.

```markdown:README.md
# Invoice Management System

A modern, full-stack invoice management system built with TypeScript, Express, and PostgreSQL. This application allows businesses to manage customers, create invoices, track payments, and handle document generation.

## Core Features

- **User Management**
  - Secure authentication
  - Role-based authorization
  - Profile management
  - Business information management

- **Customer Management**
  - Customer profiles
  - Contact information
  - Transaction history
  - Business details

- **Document Management**
  - Invoice generation
  - Receipt creation
  - Quotation handling
  - Custom document numbering
  - Payment tracking

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching**: Redis
- **Validation**: Zod
- **Authentication**: JWT
- **Email**: MailHog (development)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database Admin**: pgAdmin
- **Development Tools**: ESLint, Prettier
- **Testing**: Jest

## Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- Git
- Make (optional)

## Getting Started

1. **Clone the Repository**
```bash
git clone <repository-url>
cd invoice_app
```

2. **Environment Setup**
```bash
# Copy environment files
cp backend/.env.example backend/.env
```

3. **Start Docker Services**
```bash
# Using Make
make build

# Without Make
docker compose -f local.yml up --build -d
```

4. **Install Dependencies**
```bash
cd backend
npm install
```

5. **Database Setup**
```bash
npm run prisma:generate
npm run prisma:push
```

6. **Start Development Server**
```bash
npm run dev
```

## Docker Services & Ports

| Service    | Port  | Purpose                    |
|------------|-------|----------------------------|
| API        | 3000  | Backend API               |
| PostgreSQL | 5432  | Main Database             |
| Redis      | 6379  | Caching & Session Store   |
| pgAdmin    | 5050  | Database Management UI    |
| MailHog    | 8025  | Email Testing Interface   |
|            | 1025  | SMTP Server               |

## Development Tools

### Make Commands
```bash
make build          # Build and start all services
make up            # Start services
make down          # Stop services
make down-v        # Stop services and remove volumes
make logs          # View all logs
make db-shell      # PostgreSQL shell
make redis-shell   # Redis shell
make backup-db     # Backup database
make restore-db    # Restore database
make health        # Check services health
```

### NPM Scripts
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run test          # Run tests
npm run lint          # Run ESLint
npm run format        # Format code
npm run prisma:push   # Update database schema
```

## Project Structure
```
invoice_app/
├── backend/
│   ├── src/
│   │   ├── utils/
│   │   │   ├── validators/    # Zod schemas
│   │   │   ├── services/      # Business logic
│   │   │   ├── types/         # Type definitions
│   │   │   ├── db.ts         # Database client
│   │   │   └── generators/   # Utility generators
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── local.yml                # Docker compose config
└── Makefile                # Development automation
```

## Environment Configuration

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Mail
SMTP_HOST=localhost
SMTP_PORT=1025
```

## Database Access

### pgAdmin
- **URL**: http://localhost:5050
- **Email**: admin@admin.com
- **Password**: admin

### Direct Access
```bash
make db-shell
# or
docker compose -f local.yml exec postgres psql -U postgres -d app_db
```

## API Documentation

Coming soon...

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## Development Workflow

1. **Start Services**
```bash
make up
```

2. **Watch for Changes**
```bash
npm run dev
```

3. **Database Changes**
```bash
npm run prisma:generate  # After schema changes
npm run prisma:push     # Update database
```

## Troubleshooting

1. **Reset Database**
```bash
make reset-db
```

2. **View Logs**
```bash
make logs
make logs-api   # API logs only
make logs-db    # Database logs only
```

3. **Check Service Health**
```bash
make health
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

This updated README:
1. Provides more detailed information about the current implementation
2. Includes specific ports and configurations
3. Has a comprehensive development workflow section
4. Includes troubleshooting steps
5. Better organizes the information with clear sections
6. Adds a table for services and ports
7. Includes more detailed project structure
8. Provides clear instructions for database access
9. Lists all available development tools and commands
