# Solar Winds - Full Stack Application

A modern full stack application built with React + TypeScript frontend, NestJS backend, and PostgreSQL database. Features GSAP animations and follows Clean Architecture and SOLID principles.

## 🏗️ Project Structure

```
solar-winds/
├── frontend/          # React + TypeScript + Vite
├── backend/           # NestJS + PostgreSQL + TypeORM
├── docker-compose.yml # PostgreSQL containerization
├── init-scripts/      # Database initialization scripts
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** with TypeScript
- **Vite 7.0.4** for build tooling
- **GSAP 3.13.0** for animations
- **ESLint** for code linting

### Backend
- **NestJS 11.1.5** with TypeScript
- **PostgreSQL 15** with TypeORM
- **TypeORM entities** with business logic validation
- **Environment-based configuration**
- **CORS enabled** for frontend communication

### Database
- **PostgreSQL 15** running in Docker container
- **TypeORM** for database operations and migrations
- **Persistent data storage** with Docker volumes
- **Solar energy monitoring entities**: Users, Addresses, Sensors, Events

## 📋 Prerequisites

Before running this project, make sure you have installed:

- **Node.js** (v20.18.0 or higher)
- **npm** (v10.8.2 or higher)
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd solar-winds
```

### 2. Environment Configuration

#### Backend Environment Setup
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and configure your environment variables:
```env
DATABASE_URL=postgresql://admin:password@localhost:5432/solarwinds
PORT=8001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:5173
# ... other configurations
```

#### Frontend Environment Setup
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env` and configure your environment variables:
```env
VITE_API_BASE_URL=http://localhost:8001
VITE_APP_NAME=Solar Winds
VITE_ENABLE_DEBUG=true
# ... other configurations
```

### 3. Database Setup

Start the PostgreSQL database using Docker:

```bash
# From the root directory (solar-winds/)
docker-compose up -d
```

Verify the database is running:
```bash
docker-compose logs postgres
```

### 4. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run start:dev
```

The backend API will be available at `http://localhost:8001`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend application will be available at `http://localhost:5173`

## 🎯 Running the Full Stack

### Option 1: Manual Start (Recommended for Development)

1. **Start Database:**
   ```bash
   docker-compose up -d
   ```

2. **Start Backend (in a new terminal):**
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Start Frontend (in another terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

### Option 2: Using Automated Scripts (Recommended)

Use the provided startup scripts to automate the entire process:

#### Windows
```bash
# Start the application
./start.bat

# Stop the application
./stop.bat
```

#### Linux/macOS/Unix
```bash
# Start the application
./start.sh

# Stop the application
./stop.sh
```

**What the startup scripts do:**
- ✅ Check prerequisites (Docker, Node.js, npm)
- ✅ Verify environment files (create from examples if missing)
- ✅ Check for port conflicts
- ✅ Start PostgreSQL container
- ✅ Install dependencies if needed
- ✅ Start backend and frontend servers
- ✅ Provide real-time status and logs

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8001
- **Database:** localhost:5432

## 📝 Available Scripts

### Automated Scripts (from root directory)
```bash
# Windows
start.bat           # Start entire application stack
stop.bat            # Stop all services

# Linux/macOS/Unix
./start.sh          # Start entire application stack
./stop.sh           # Stop all services
```

### Frontend Scripts (from `frontend/` directory)
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

### Backend Scripts (from `backend/` directory)
```bash
npm run start:dev   # Start development server with watch mode
npm run start       # Start production server
npm run build       # Build for production
```

### Database Scripts (from root directory)
```bash
docker-compose up -d              # Start PostgreSQL in detached mode
docker-compose down               # Stop and remove containers
docker-compose logs postgres      # View PostgreSQL logs
docker-compose restart postgres   # Restart PostgreSQL container
```

## 🔧 Development Workflow

### Quick Start (Recommended)
1. **Run the startup script:** `./start.sh` (Linux/macOS) or `start.bat` (Windows)
2. **Access the application** at http://localhost:5173
3. **Stop when done:** `./stop.sh` (Linux/macOS) or `stop.bat` (Windows)

### Manual Start (Advanced)
1. **Start the database** first using Docker Compose
2. **Start the backend** development server
3. **Start the frontend** development server
4. **Access the application** at http://localhost:5173

The frontend will automatically show the API connection status and environment information.

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f postgres

# Remove volumes (⚠️ This will delete all data)
docker-compose down -v
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                    # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage
```

### Frontend Testing
```bash
cd frontend
npm test                   # Run tests (when configured)
```

## 📚 Project Documentation

- **Root CLAUDE.md** - General project overview and commands
- **backend/CLAUDE.md** - Backend development guidelines (SOLID, Clean Architecture, TDD)
- **frontend/CLAUDE.md** - Frontend development guidelines (React best practices)

## 🔐 Security Notes

- **Never commit `.env` files** to version control
- **Change default passwords** in production
- **Use strong JWT secrets** in production
- **Enable HTTPS** in production
- **Update dependencies** regularly

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :8001
   netstat -ano | findstr :5173
   ```

2. **PostgreSQL connection failed:**
   ```bash
   # Check if PostgreSQL container is running
   docker ps
   
   # Restart PostgreSQL
   docker-compose restart postgres
   ```

3. **Environment variables not loaded:**
   - Ensure `.env` files exist in both frontend and backend directories
   - Restart the development servers after changing environment variables

4. **CORS errors:**
   - Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
   - Check `VITE_API_BASE_URL` in frontend `.env` points to your backend

### Getting Help

- Check the logs: `docker-compose logs postgres`
- Verify API health: Visit `http://localhost:8001/health`
- Check environment: The frontend displays current environment configuration

## 🤝 Contributing

1. Follow the coding standards defined in the respective CLAUDE.md files
2. Write tests for new features
3. Update documentation as needed
4. Follow the established project structure

## 📄 License

This project is licensed under the ISC License.
