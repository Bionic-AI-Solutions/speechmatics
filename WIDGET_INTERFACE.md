# Voice Bot Widget Interface

## Overview

The Voice Bot Widget provides a modern, mobile-first interface for voice conversations with AI personas. The interface is designed as a collapsible widget that can be embedded in web applications.

## Features

### 🎯 Widget States

1. **Collapsed State**: Small floating widget in bottom-right corner
   - Shows two circular icons: user avatar and phone icon
   - Click to expand the full interface

2. **Expanded State**: Full conversation interface
   - Language selector at the top (Hindi flag + "हिन्दी")
   - Transcript window with auto-scrolling
   - Central persona illustration
   - Phone button for conversation control
   - Status indicators

### 🎤 Conversation Control

- **Start Conversation**: Click the black phone icon
- **End Conversation**: Click the red phone icon (appears when active)
- **Auto-scrolling Transcript**: Messages appear in real-time with automatic scrolling

### 🌐 Language Support

- **Hindi Language**: Default language with proper TTS support
- **Language Selector**: Top bar shows Hindi flag and language name
- **Transcription**: Supports Hindi transcription for user speech
- **TTS Response**: Hindi female voice (Priya) for AI responses

### 📱 Mobile-First Design

- **Responsive Layout**: Optimized for mobile devices
- **Touch-Friendly**: Large buttons and touch targets
- **Clean Interface**: Minimal, focused design
- **Status Indicators**: Visual feedback for conversation state

## Technical Implementation

### Components

- **`VoiceBotWidget.tsx`**: Main widget component
- **`page.tsx`**: Updated to use widget interface
- **Transcript Management**: Real-time message display with auto-scroll
- **Audio Integration**: PCM audio recording and TTS playback

### Key Features

1. **Collapsible Interface**: Toggle between collapsed and expanded states
2. **Real-time Transcript**: Live conversation display with auto-scrolling
3. **Phone Icon Control**: Single button for start/stop conversation
4. **Language Selection**: Hindi language support with proper TTS
5. **Status Indicators**: Visual feedback for conversation state
6. **Error Handling**: Graceful error handling and user feedback

### Audio Pipeline

1. **Microphone Input**: PCM audio recording via Speechmatics
2. **Speech Recognition**: Hindi transcription support
3. **AI Response**: Speechmatics Flow for conversation
4. **TTS Output**: Google Cloud TTS with Hindi female voice
5. **Audio Playback**: Direct Web Audio API for reliable playback

## Usage

1. **Open Widget**: Click the collapsed widget to expand
2. **Start Conversation**: Click the black phone icon
3. **Speak**: Talk naturally in Hindi or English
4. **View Transcript**: See real-time conversation in the top window
5. **End Conversation**: Click the red phone icon to stop

## Customization

The widget can be easily customized by modifying:

- **Colors**: Update Tailwind CSS classes
- **Personas**: Add new personas in the `personas/` directory
- **Languages**: Extend language support in the widget
- **Styling**: Modify the component styles for different themes

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Support**: iOS Safari, Android Chrome
- **Audio Requirements**: Web Audio API support
- **Microphone Access**: User permission required