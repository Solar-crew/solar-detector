# Solar Detector

A web application that analyzes geographical areas to determine their suitability for solar panel installation. This tool helps users make informed decisions about solar energy investments by providing detailed analysis of sunlight exposure, roof area, and estimated capacity.

## Project Overview

Solar Detector is designed as a monolith application for a masterclass demonstration. It provides:
- Location-based solar suitability analysis
- Sunlight hours estimation
- Roof area and capacity calculations
- Interactive web interface for easy access

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui with Radix UI primitives
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Validation**: Zod

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 16
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Server**: Uvicorn with auto-reload

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Development**: Hot-reload enabled for both frontend and backend

## Project Structure

```
solar-detector/
├── apps/
│   ├── api/                    # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/           # API routes
│   │   │   │   └── v1/
│   │   │   │       └── endpoints/
│   │   │   │           └── analyses.py
│   │   │   ├── core/          # Core configuration
│   │   │   │   ├── config.py
│   │   │   │   └── database.py
│   │   │   ├── models/        # SQLAlchemy models
│   │   │   │   └── analysis.py
│   │   │   ├── schemas/       # Pydantic schemas
│   │   │   │   └── analysis.py
│   │   │   └── main.py        # Application entry point
│   │   ├── alembic/           # Database migrations
│   │   ├── tests/             # API tests
│   │   ├── requirements.txt
│   │   └── alembic.ini
│   │
│   └── frontend/              # React frontend
│       ├── src/
│       │   ├── components/    # React components
│       │   │   └── ui/       # Shadcn components
│       │   ├── lib/          # Utilities
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── package.json
│       └── vite.config.ts
│
├── packages/
│   ├── shared-js/            # Shared JavaScript utilities
│   └── shared-python/        # Shared Python utilities
│
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── api.Dockerfile
│   │   ├── frontend.Dockerfile
│   │   ├── .env.example
│   │   └── .env
│   ├── k8s/                  # Kubernetes configs (future)
│   └── scripts/
│
├── Makefile                   # Development commands
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Make (optional, but recommended)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solar-detector
   ```

2. **Start the application**
   ```bash
   make dev
   ```
   This will:
   - Build all Docker containers
   - Start PostgreSQL database
   - Start FastAPI backend on http://localhost:8000
   - Start React frontend on http://localhost:5173
   - Run database migrations automatically

   **Note:** No setup required! The app uses sensible defaults. To customize settings, see [Environment Variables](#environment-variables).

3. **Access the application**
   - Frontend: http://localhost:5173
   - API Documentation: http://localhost:8000/docs
   - API Alternative Docs: http://localhost:8000/redoc
   - Health Check: http://localhost:8000/health

### Alternative Start Methods

Without Make:
```bash
cd infra/docker
docker compose up --build
```

## Available Commands

Run `make help` to see all available commands:

```bash
make dev          # Start all services in development mode with rebuild
make up           # Start all services (without rebuild)
make down         # Stop all services
make logs         # Follow logs from all services
make clean        # Remove containers, volumes, and cached files
make lint         # Run linters on backend and frontend
make format       # Format code (black for Python, prettier for JS)
make test         # Run tests
make migrate      # Run database migrations
make migration    # Create a new migration (use MESSAGE='description')
make db-shell     # Open PostgreSQL shell
make api-shell    # Open shell in API container
```

## Database Migrations

### Running Migrations
Migrations are automatically run when the API container starts. To manually run migrations:
```bash
make migrate
```

### Creating New Migrations
After modifying models in `apps/api/app/models/`:
```bash
make migration MESSAGE="add new field to analysis"
```

This will:
1. Auto-generate a migration file based on model changes
2. Save it to `apps/api/alembic/versions/`

### Migration Management
```bash
# Inside API container
docker compose exec api alembic current          # Show current revision
docker compose exec api alembic history          # Show migration history
docker compose exec api alembic downgrade -1     # Rollback one migration
```

## API Documentation

### Endpoints

#### Health Check
- `GET /health` - Service health status

#### Analyses
- `POST /api/v1/analyses` - Create new analysis
- `GET /api/v1/analyses` - List all analyses (with pagination)
- `GET /api/v1/analyses/{id}` - Get specific analysis
- `PATCH /api/v1/analyses/{id}` - Update analysis results
- `DELETE /api/v1/analyses/{id}` - Delete analysis

### Example Request
```bash
curl -X POST http://localhost:8000/api/v1/analyses \
  -H "Content-Type: application/json" \
  -d '{
    "location_name": "San Francisco",
    "latitude": 37.7749,
    "longitude": -122.4194
  }'
```

## Database Schema

### Analysis Table
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| location_name | String | Name of the location |
| latitude | Float | Latitude coordinate |
| longitude | Float | Longitude coordinate |
| suitability_score | Float | Score from 0-100 |
| annual_sunlight_hours | Float | Estimated annual sunlight hours |
| roof_area | Float | Available roof area (m²) |
| estimated_capacity | Float | Estimated solar capacity (kW) |
| extra_data | JSON | Additional analysis data |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

## Development Workflow

### Backend Development
1. Make changes to Python files in `apps/api/app/`
2. Changes are automatically reloaded (uvicorn --reload)
3. Run tests: `make test`
4. Format code: `make format`

### Frontend Development
1. Make changes to files in `apps/frontend/src/`
2. Vite HMR automatically updates the browser
3. Lint code: `cd apps/frontend && yarn lint`

### Database Changes
1. Modify models in `apps/api/app/models/`
2. Create migration: `make migration MESSAGE="description"`
3. Apply migration: `make migrate`

## Environment Variables

### Default Behavior
**No configuration needed!** The application works out-of-the-box with sensible defaults defined in `docker-compose.yml`.

### Optional Customization
To override defaults, create a `.env` file in `infra/docker/`:

```bash
cp infra/docker/.env.example infra/docker/.env
# Edit .env with your custom values
```

### Configuration Reference

```bash
# Database Configuration
POSTGRES_USER=user
POSTGRES_PASSWORD=change_me_in_production  # Use strong password in production!
POSTGRES_DB=solar_detector
POSTGRES_HOST=db
POSTGRES_PORT=5432

# API Configuration
API_V1_PREFIX=/api/v1

# Frontend Configuration
VITE_API_URL=http://localhost:8000  # Update for production deployment
```

**Important Notes:**
- `.env` is gitignored and never committed to version control
- `.env.example` is tracked in git and contains safe placeholder values
- For production, always use strong, unique passwords
- Each environment (dev/staging/production) should have its own `.env` file

## Troubleshooting

### Database Connection Issues
```bash
# Check database is running
make logs

# Restart database
make down && make up
```

### Clean Start
```bash
# Remove all containers and volumes
make clean

# Start fresh
make dev
```

### Access Logs
```bash
# All services
make logs

# Specific service
cd infra/docker && docker compose logs -f api
cd infra/docker && docker compose logs -f frontend
cd infra/docker && docker compose logs -f db
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

[Your License Here]

## Support

For questions or issues, please open an issue on GitHub.
  