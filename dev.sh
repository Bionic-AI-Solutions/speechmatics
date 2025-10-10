#!/bin/bash

# Development script for Speechmatics Voice Chat Application
# This script provides easy commands to work with the Docker setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
}

# Function to check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from env.example..."
        cp env.example .env
        print_warning "Please edit .env file with your actual API keys before running the application."
        return 1
    fi
    return 0
}

# Function to build and start development environment
dev_start() {
    print_status "Starting development environment..."
    check_docker
    check_env
    
    print_status "Building and starting containers..."
    docker-compose -f docker-compose.dev.yml up --build -d
    
    print_success "Development environment started!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:8000"
    print_status "Backend Docs: http://localhost:8000/docs"
}

# Function to stop development environment
dev_stop() {
    print_status "Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
    print_success "Development environment stopped!"
}

# Function to restart development environment
dev_restart() {
    print_status "Restarting development environment..."
    dev_stop
    dev_start
}

# Function to view logs
dev_logs() {
    if [ -n "$1" ]; then
        docker-compose -f docker-compose.dev.yml logs -f "$1"
    else
        docker-compose -f docker-compose.dev.yml logs -f
    fi
}

# Function to clean up everything
dev_clean() {
    print_status "Cleaning up development environment..."
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed!"
}

# Function to run backend tests
test_backend() {
    print_status "Running backend tests..."
    docker-compose -f docker-compose.dev.yml exec backend python -m pytest
}

# Function to run frontend tests
test_frontend() {
    print_status "Running frontend tests..."
    docker-compose -f docker-compose.dev.yml exec frontend npm test
}

# Function to show status
dev_status() {
    print_status "Development environment status:"
    docker-compose -f docker-compose.dev.yml ps
}

# Function to show help
show_help() {
    echo "Speechmatics Voice Chat - Development Script"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Build and start development environment"
    echo "  stop      - Stop development environment"
    echo "  restart   - Restart development environment"
    echo "  logs      - View logs (optionally specify service: backend|frontend)"
    echo "  status    - Show status of containers"
    echo "  clean     - Clean up everything (containers, volumes, images)"
    echo "  test      - Run all tests"
    echo "  test-backend  - Run backend tests only"
    echo "  test-frontend - Run frontend tests only"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh start"
    echo "  ./dev.sh logs backend"
    echo "  ./dev.sh test"
}

# Main script logic
case "${1:-help}" in
    start)
        dev_start
        ;;
    stop)
        dev_stop
        ;;
    restart)
        dev_restart
        ;;
    logs)
        dev_logs "$2"
        ;;
    status)
        dev_status
        ;;
    clean)
        dev_clean
        ;;
    test)
        test_backend
        test_frontend
        ;;
    test-backend)
        test_backend
        ;;
    test-frontend)
        test_frontend
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
