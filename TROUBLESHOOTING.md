# Solar Winds Troubleshooting Guide

## Common Issues and Solutions

### 🐛 dev.bat Script Issues

#### Problem: Unicode characters not displaying properly
**Solution 1**: Use the simple version
```bash
dev-simple.bat
```

**Solution 2**: Change Windows console encoding
```bash
chcp 65001
dev.bat
```

#### Problem: Batch script syntax errors
**Solution**: Use the simple version which has minimal complex logic
```bash
dev-simple.bat
```

#### Problem: Docker commands failing
**Symptoms**: 
- "Docker not found" errors
- "Container not accessible" errors

**Solutions**:
1. **Check Docker Desktop is running**:
   ```bash
   docker --version
   docker ps
   ```

2. **Start Docker Desktop manually** and wait for it to fully load

3. **Check Docker daemon status**:
   ```bash
   docker info
   ```

4. **Restart Docker Desktop** if needed

### 🗃️ Database Issues

#### Problem: PostgreSQL container won't start
**Symptoms**:
- "Port 5432 already in use"
- "Container creation failed"

**Solutions**:
1. **Check if PostgreSQL is already running locally**:
   ```bash
   netstat -an | findstr 5432
   ```

2. **Stop local PostgreSQL service**:
   - Open Services (services.msc)
   - Find "PostgreSQL" service
   - Stop it

3. **Use different port** (edit docker-compose.yml):
   ```yaml
   ports:
     - "5433:5432"  # Change to different port
   ```

4. **Reset Docker containers**:
   ```bash
   docker-compose down
   docker system prune -f
   docker-compose up -d postgres
   ```

#### Problem: Database seeding fails
**Symptoms**:
- "Permission denied" errors
- "File not found" errors
- SQL syntax errors

**Solutions**:
1. **Use simple seeding script**:
   ```bash
   scripts\seed-simple.bat
   ```

2. **Check file paths** - Make sure you're in the project root directory

3. **Manual seeding**:
   ```bash
   docker exec -i solarwinds-postgres psql -U admin -d solarwinds < scripts\seed-database.sql
   ```

4. **Reset database completely**:
   ```bash
   docker-compose down
   docker volume rm solar-winds_postgres_data
   docker-compose up -d postgres
   ```

### 🔧 Backend Issues

#### Problem: Backend won't start
**Symptoms**:
- "Port 8001 already in use"
- "Module not found" errors
- TypeScript compilation errors

**Solutions**:
1. **Check port availability**:
   ```bash
   netstat -an | findstr 8001
   ```

2. **Kill process using port**:
   ```bash
   taskkill /f /im node.exe
   ```

3. **Clean install dependencies**:
   ```bash
   cd backend
   rmdir /s node_modules
   del package-lock.json
   npm install
   ```

4. **Check environment variables**:
   ```bash
   # Verify backend\.env file exists and has correct database config
   type backend\.env
   ```

5. **Manual backend start**:
   ```bash
   cd backend
   npm run start:dev
   ```

#### Problem: Database connection refused
**Symptoms**:
- "ECONNREFUSED" errors
- "Unable to connect to database"

**Solutions**:
1. **Wait longer for database**:
   ```bash
   timeout /t 15 /nobreak
   ```

2. **Check database health**:
   ```bash
   docker exec solarwinds-postgres pg_isready -U admin -d solarwinds
   ```

3. **Check connection details in backend\.env**:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=admin
   DB_PASSWORD=password
   DB_NAME=solarwinds
   ```

### 🌐 Frontend Issues

#### Problem: Frontend won't start
**Symptoms**:
- "Port 5173 already in use"
- "Vite build errors"

**Solutions**:
1. **Check port availability**:
   ```bash
   netstat -an | findstr 5173
   ```

2. **Use different port**:
   ```bash
   cd frontend
   npm run dev -- --port 5174
   ```

3. **Clean install**:
   ```bash
   cd frontend
   rmdir /s node_modules
   del package-lock.json
   npm install
   ```

4. **Manual frontend start**:
   ```bash
   cd frontend
   npm run dev
   ```

### 🔗 Connection Issues

#### Problem: Frontend can't connect to backend
**Symptoms**:
- API calls failing
- "Network Error" in browser console

**Solutions**:
1. **Check backend is running**:
   ```bash
   curl http://localhost:8001/health
   ```
   Or visit in browser: http://localhost:8001

2. **Check CORS configuration** in backend/src/main.ts

3. **Verify API base URL** in frontend code

4. **Check both services are running on correct ports**:
   - Backend: http://localhost:8001
   - Frontend: http://localhost:5173

## 🛠️ Manual Startup Process

If automated scripts fail, start services manually:

### 1. Start Database
```bash
docker-compose up -d postgres
timeout /t 10 /nobreak
docker exec solarwinds-postgres pg_isready -U admin -d solarwinds
```

### 2. Seed Database (Optional)
```bash
docker exec -i solarwinds-postgres psql -U admin -d solarwinds < scripts\seed-database.sql
```

### 3. Start Backend
```bash
cd backend
npm install
npm run start:dev
```

### 4. Start Frontend (New Command Window)
```bash
cd frontend
npm install
npm run dev
```

## 🔍 Diagnostic Commands

### Check System Status
```bash
# Check Docker
docker --version
docker ps
docker-compose ps

# Check Node.js
node --version
npm --version

# Check ports
netstat -an | findstr "5173 8001 5432"

# Check database
docker exec solarwinds-postgres psql -U admin -d solarwinds -c "SELECT version();"
```

### View Logs
```bash
# Docker logs
docker-compose logs postgres
docker logs solarwinds-postgres

# Backend logs (in backend terminal)
# Frontend logs (in frontend terminal)
```

## 🚨 Emergency Reset

If everything fails, complete reset:

```bash
# Stop all services
taskkill /f /im node.exe
docker-compose down

# Clean everything
docker system prune -f
docker volume prune -f

# Clean Node modules
cd backend && rmdir /s node_modules && cd ..
cd frontend && rmdir /s node_modules && cd ..

# Restart fresh
docker-compose up -d postgres
timeout /t 15 /nobreak
cd backend && npm install && npm run start:dev
# In new window: cd frontend && npm install && npm run dev
```

## 📞 Getting Help

### Log Files to Check
1. **Docker Desktop logs** (Docker Desktop → Troubleshoot → Get Support)
2. **Backend console output**
3. **Frontend console output**
4. **Browser developer tools** (F12 → Console/Network tabs)

### Information to Provide
When asking for help, include:
- Operating System version
- Docker Desktop version
- Node.js version
- Error messages (exact text)
- Steps that led to the error
- Which script you were running

### Quick Health Check
Run this command to get system status:
```bash
echo "=== Docker Status ===" && docker --version && docker ps && echo "=== Node Status ===" && node --version && npm --version && echo "=== Port Status ===" && netstat -an | findstr "5173 8001 5432"
```

## 💡 Pro Tips

1. **Always run scripts from project root directory**
2. **Wait for services to fully start** before testing
3. **Use simple versions** if complex scripts fail
4. **Check Windows Defender/Antivirus** - may block Docker
5. **Run Command Prompt as Administrator** if permission issues
6. **Close other development tools** that might use same ports
7. **Restart computer** if Docker becomes unresponsive

Your Solar Winds development environment should work smoothly with these solutions! 🌞