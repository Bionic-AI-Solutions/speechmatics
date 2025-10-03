# 🚀 Quick Start Guide

Get your Voice Bot App running in 5 minutes!

## 1. Get Your API Key

1. Sign up at [Speechmatics](https://www.speechmatics.com/)
2. Go to your account settings
3. Generate an API key for Flow service
4. Copy the key

## 2. Set Up the App

```bash
# Copy the environment file
cp env.example .env.local

# Edit .env.local and add your API key
# API_KEY="your-actual-api-key-here"
```

## 3. Run the App

```bash
# Install dependencies (if not done already)
npm install

# Start the development server
npm run dev
```

## 4. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## 5. Start Talking!

1. **Allow microphone access** when prompted
2. **Select an AI persona** from the dropdown
3. **Click "Start Conversation"**
4. **Speak naturally** - the AI will respond!

## 🎯 Features You Can Use

- **Multiple AI Personas**: Choose different AI personalities
- **Real-time Conversation**: See the transcript as you talk
- **Microphone Controls**: Mute/unmute, device selection
- **Status Monitoring**: See connection and recording status

## 🔧 Troubleshooting

**"Microphone access denied"**
- Check browser permissions
- Try refreshing the page

**"Failed to start session"**
- Verify your API key is correct
- Check your Speechmatics account status

**No audio devices found**
- Check microphone is connected
- Try a different browser

## 📚 Need More Help?

- Check the full [README.md](README.md) for detailed documentation
- Visit [Speechmatics Documentation](https://docs.speechmatics.com/voice-agents-flow)
- Open an issue on GitHub

---

**Happy chatting! 🎤✨**