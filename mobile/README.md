# 1ai Mobile App

React Native mobile app for the 1ai multi-model AI chat platform.

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router (file-based)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: StyleSheet (no external CSS framework)
- **State**: React hooks + Context API
- **Authentication**: JWT with Expo SecureStore
- **UI Components**: Custom components + Ionicons

## Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication flow
│   │   ├── signin.tsx     # Email input
│   │   └── otp.tsx        # OTP verification
│   ├── (main)/            # Main app screens
│   │   ├── chat.tsx       # Chat interface
│   │   ├── apps/          # AI applications
│   │   ├── pricing.tsx    # Subscription plans
│   │   ├── settings.tsx   # User settings
│   │   └── webview.tsx    # External links
│   ├── home.tsx           # Landing page
│   ├── index.tsx          # Auth check & routing
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # Basic UI components
│   │   └── chat/         # Chat-specific components
│   ├── screens/          # Screen implementations
│   ├── services/         # API client
│   ├── contexts/         # React contexts
│   ├── constants/        # Theme & spacing
│   ├── utils/            # Utilities & data
│   └── types/            # TypeScript types
└── assets/               # Images & icons
```

## Development Commands

### Setup
```bash
bun install                 # Install dependencies
```

### Development
```bash
bun run start              # Start Expo dev server
bun run ios                # Launch on iOS device/simulator
bun run android            # Launch on Android device/emulator
bun run web                # Launch web version
```

### Expo Commands
```bash
bunx expo install --fix    # Fix SDK compatibility
bunx expo run:ios          # Build and run on iOS
bunx expo run:android      # Build and run on Android
```

## Release Commands (EAS)

### Setup EAS
```bash
npm install -g eas-cli     # Install EAS CLI
eas login                  # Login to Expo account
eas init                   # Initialize EAS in project
eas build:configure        # Create eas.json config
```

### Development Builds
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production Builds
```bash
eas build --platform all                    # Build for both platforms
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Local Builds (for debugging)
```bash
eas build --platform ios --local
eas build --platform android --local
```

### App Store Submission
```bash
eas submit --platform ios     # Submit to App Store
eas submit --platform android # Submit to Google Play
```

### Build Management
```bash
eas build:list                # List all builds
eas build:view [BUILD_ID]     # View build details
eas build:cancel [BUILD_ID]   # Cancel running build
```

## Key Features

- **Multi-Model Chat**: Access 20+ AI models (GPT, Claude, Gemini, etc.)
- **Real-time Streaming**: Live AI responses via Server-Sent Events
- **Authentication**: Email + OTP flow with secure token storage
- **Chat History**: Full conversation history with sidebar navigation
- **AI Applications**: Extensible app ecosystem (Article Summarizer)
- **Theme Support**: Light/Dark mode with system integration
- **Credit System**: Premium subscription with usage tracking
- **Responsive Design**: Optimized for phones and tablets

## API Integration

- **Base URL**: `https://api.1ai.co`
- **Provider**: OpenRouter API (not direct OpenAI)
- **Authentication**: JWT Bearer tokens
- **Storage**: Expo SecureStore for sensitive data

## Environment Requirements

- **iOS**: iOS 13+ (iPhone 6s and newer)
- **Android**: Android 6+ (API level 23+)
- **Development**: 
  - Node.js 18+
  - Bun runtime
  - Expo CLI
  - iOS: Xcode 14+ (macOS only)
  - Android: Android Studio

## Release Prerequisites

- **iOS**: Apple Developer Program membership ($99/year)
- **Android**: Google Play Developer account ($25 one-time)

## Configuration Files

- `app.json` - Expo app configuration
- `eas.json` - EAS build profiles (created by `eas build:configure`)
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration