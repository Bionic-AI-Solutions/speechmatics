# Speechmatics Voice Chat Application

A full-stack voice chat application with Speechmatics Flow integration, featuring a Next.js frontend and FastAPI backend.

## 🏗️ Project Structure

```
speechmatics/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile         # Backend container configuration
│   └── env.example        # Backend environment variables
├── frontend/               # Next.js frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── package.json       # Node.js dependencies
│   ├── Dockerfile         # Frontend container configuration
│   └── next.config.ts     # Next.js configuration
├── docker-compose.yml     # Production Docker Compose
├── docker-compose.dev.yml # Development Docker Compose
└── env.example           # Root environment variables
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Speechmatics API key

### 1. Environment Setup

```bash
# Copy environment file
cp env.example .env

# Edit .env with your API keys
API_KEY=your-speechmatics-api-key-here
BACKEND_API_KEY=your-backend-api-key-here
```

### 2. Development Mode

```bash
# Start both frontend and backend
docker-compose -f docker-compose.dev.yml up --build

# Or start individually:
# Backend only
cd backend && python -m uvicorn main:app --reload

# Frontend only
cd frontend && npm run dev
```

### 3. Production Mode

```bash
# Build and start all services
docker-compose up --build
```

## 🌐 Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Backend API

### Authentication

All API endpoints require authentication via Bearer token:

```bash
curl -H "Authorization: Bearer your-backend-api-key" \
     http://localhost:8000/api/jwt
```

### Endpoints

- `POST /api/jwt` - Generate Speechmatics JWT token
- `POST /api/conversation/start` - Start new conversation
- `POST /api/conversation/{session_id}/end` - End conversation
- `GET /api/conversation/{session_id}/status` - Get conversation status
- `GET /health` - Health check

## 🎤 Frontend Features

- **Voice Chat Interface**: Clean, simple voice conversation UI
- **Real-time Transcripts**: Live transcription display
- **Prominent Toggle Button**: Large microphone button for start/stop
- **Responsive Design**: Works on desktop and mobile
- **Backend Integration**: Communicates with FastAPI backend

## 🛠️ Development

### Backend Development

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Adding New Features

1. **Backend APIs**: Add new endpoints in `backend/main.py`
2. **Frontend Integration**: Update `frontend/src/app/actions.ts`
3. **UI Components**: Create components in `frontend/src/components/`

## 🔐 Security

- Backend API key authentication
- CORS configuration for frontend domains
- Environment variable management
- Non-root Docker containers

## 📦 Deployment

### Docker Compose (Recommended)

```bash
# Production deployment
docker-compose up -d

# Development deployment
docker-compose -f docker-compose.dev.yml up -d
```

### Manual Deployment

1. **Backend**: Deploy FastAPI app to your preferred platform
2. **Frontend**: Build and deploy Next.js app
3. **Environment**: Set up environment variables

## 🧪 Testing

```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests
cd frontend && npm test
```

## 📝 API Documentation

Visit http://localhost:8000/docs for interactive API documentation when running the backend.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the API documentation at `/docs`
- Review the environment configuration
- Ensure all services are running
- Check Docker logs for errors