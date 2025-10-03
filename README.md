# 🎤 Voice Bot App

A modern, responsive voice bot application built with Next.js and Speechmatics Flow. Have natural conversations with AI using real-time speech-to-text and text-to-speech capabilities.

## ✨ Features

- **Real-time Voice Conversations**: Speak naturally with AI personas
- **Multiple AI Personas**: Choose from different AI personalities
- **Live Transcript**: See the conversation in real-time
- **Microphone Controls**: Mute/unmute, device selection
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, intuitive interface with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or later
- A Speechmatics account and API key
- A modern web browser with microphone access

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd voice-bot-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Speechmatics API key:
   ```env
   API_KEY="your-speechmatics-api-key-here"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

1. **Allow microphone access** when prompted by your browser
2. **Select an AI persona** from the dropdown menu
3. **Click "Start Conversation"** to begin
4. **Speak naturally** - the AI will respond with voice and text
5. **Use the volume slider** to adjust AI voice volume
6. **Mute/unmute** your microphone as needed

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS** for styling
- **React Context** for state management

### Audio Processing
- **Speechmatics Flow API** for real-time voice processing
- **Web Audio API** for microphone input and audio playback
- **PCM Audio Worklets** for low-latency audio processing

### Key Components
- `Controls.tsx` - Main conversation controls
- `TranscriptView.tsx` - Real-time conversation display
- `Status.tsx` - Connection and recording status
- `MicrophoneSelect.tsx` - Audio device selection

## 🔧 Configuration

### Environment Variables

```env
# Speechmatics API Configuration
API_KEY="your-speechmatics-api-key"

# Application Configuration
NEXT_PUBLIC_APP_NAME="Voice Bot App"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Audio Settings

The app is configured for optimal voice conversation:
- **Sample Rate**: 16kHz for both recording and playback
- **Audio Format**: PCM 16-bit signed integer
- **Buffering**: 500ms for smooth audio streaming

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Project Structure

```
voice-bot-app/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main page component
│   ├── providers.tsx      # React context providers
│   └── actions.ts         # Server actions
├── components/            # React components
│   ├── Controls.tsx       # Main controls
│   ├── TranscriptView.tsx # Conversation display
│   ├── Status.tsx         # Status indicators
│   └── MicrophoneSelect.tsx # Audio device selection
├── hooks/                 # Custom React hooks
│   └── useAudioContexts.ts # Audio context management
├── public/                # Static assets
└── README.md             # This file
```

## 🎤 AI Personas

The app supports multiple AI personas from Speechmatics Flow:

- **Humphrey** - A friendly, conversational assistant
- **Other personas** - Additional AI personalities available

Each persona has unique characteristics and conversation styles.

## 🔍 Troubleshooting

### Common Issues

**"Microphone access denied"**
- Check browser permissions in settings
- Try refreshing the page
- Ensure microphone is connected and working

**"Failed to start session"**
- Verify your API key is correct in `.env.local`
- Check your Speechmatics account status
- Ensure you have Flow service access

**"No audio devices found"**
- Check microphone is connected
- Try a different browser
- Check system audio settings

**"WebSocket connection timeout"**
- Check internet connection
- Verify Speechmatics service status
- Try again after a few minutes

### Debug Mode

The app includes comprehensive logging. Open browser developer tools (F12) to see:
- WebSocket connection status
- Audio processing events
- Flow service responses
- Error messages and stack traces

## 📚 API Reference

### Speechmatics Flow API

This app uses the Speechmatics Flow API for real-time voice processing:

- **Documentation**: [Speechmatics Flow Docs](https://docs.speechmatics.com/voice-agents-flow)
- **Authentication**: JWT tokens with API key
- **WebSocket**: Real-time bidirectional communication
- **Audio Format**: PCM 16-bit, 16kHz sample rate

### Key API Endpoints

- **Personas**: `fetchPersonas()` - Get available AI personas
- **JWT Generation**: `getJWT()` - Generate authentication tokens
- **Flow Events**: Real-time conversation events

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Setup

Ensure production environment has:
- `API_KEY` environment variable set
- HTTPS enabled for microphone access
- Proper CORS configuration if needed

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Speechmatics](https://www.speechmatics.com/) for the Flow API
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

- **Documentation**: [Speechmatics Flow Docs](https://docs.speechmatics.com/voice-agents-flow)
- **Issues**: Open an issue on GitHub
- **Community**: Join the Speechmatics community

---

**Built with ❤️ using Next.js and Speechmatics Flow**