@echo off
setlocal enabledelayedexpansion

REM Development script for Speechmatics Voice Chat Application
REM This script provides easy commands to work with the Docker setup

set "COMPOSE_FILE=docker-compose.dev.yml"

REM Function to check if Docker is running
:check_docker
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)
goto :eof

REM Function to check if .env file exists
:check_env
if not exist .env (
    echo [WARNING] .env file not found. Creating from env.example...
    copy env.example .env >nul
    echo [WARNING] Please edit .env file with your actual API keys before running the application.
    exit /b 1
)
exit /b 0

REM Function to build and start development environment
:dev_start
echo [INFO] Starting development environment...
call :check_docker
call :check_env
if errorlevel 1 exit /b 1

echo [INFO] Building and starting containers...
docker-compose -f %COMPOSE_FILE% up --build -d

echo [SUCCESS] Development environment started!
echo [INFO] Frontend: http://localhost:3000
echo [INFO] Backend API: http://localhost:8000
echo [INFO] Backend Docs: http://localhost:8000/docs
goto :eof

REM Function to stop development environment
:dev_stop
echo [INFO] Stopping development environment...
docker-compose -f %COMPOSE_FILE% down
echo [SUCCESS] Development environment stopped!
goto :eof

REM Function to restart development environment
:dev_restart
echo [INFO] Restarting development environment...
call :dev_stop
call :dev_start
goto :eof

REM Function to view logs
:dev_logs
if "%2"=="" (
    docker-compose -f %COMPOSE_FILE% logs -f
) else (
    docker-compose -f %COMPOSE_FILE% logs -f %2
)
goto :eof

REM Function to clean up everything
:dev_clean
echo [INFO] Cleaning up development environment...
docker-compose -f %COMPOSE_FILE% down -v --remove-orphans
docker system prune -f
echo [SUCCESS] Cleanup completed!
goto :eof

REM Function to run backend tests
:test_backend
echo [INFO] Running backend tests...
docker-compose -f %COMPOSE_FILE% exec backend python -m pytest
goto :eof

REM Function to run frontend tests
:test_frontend
echo [INFO] Running frontend tests...
docker-compose -f %COMPOSE_FILE% exec frontend npm test
goto :eof

REM Function to show status
:dev_status
echo [INFO] Development environment status:
docker-compose -f %COMPOSE_FILE% ps
goto :eof

REM Function to show help
:show_help
echo Speechmatics Voice Chat - Development Script
echo.
echo Usage: dev.bat [command]
echo.
echo Commands:
echo   start     - Build and start development environment
echo   stop      - Stop development environment
echo   restart   - Restart development environment
echo   logs      - View logs (optionally specify service: backend^|frontend)
echo   status    - Show status of containers
echo   clean     - Clean up everything (containers, volumes, images)
echo   test      - Run all tests
echo   test-backend  - Run backend tests only
echo   test-frontend - Run frontend tests only
echo   help      - Show this help message
echo.
echo Examples:
echo   dev.bat start
echo   dev.bat logs backend
echo   dev.bat test
goto :eof

REM Main script logic
if "%1"=="" goto :show_help
if "%1"=="start" goto :dev_start
if "%1"=="stop" goto :dev_stop
if "%1"=="restart" goto :dev_restart
if "%1"=="logs" goto :dev_logs
if "%1"=="status" goto :dev_status
if "%1"=="clean" goto :dev_clean
if "%1"=="test" (
    call :test_backend
    call :test_frontend
    goto :eof
)
if "%1"=="test-backend" goto :test_backend
if "%1"=="test-frontend" goto :test_frontend
if "%1"=="help" goto :show_help
if "%1"=="--help" goto :show_help
if "%1"=="-h" goto :show_help

echo [ERROR] Unknown command: %1
goto :show_help
