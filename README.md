# Leago - Car Rental Mobile Application

A modern, full-featured car rental mobile application built with React Native and Expo, featuring real-time booking, payments, and multi-language support.

## Overview

Leago is a comprehensive car rental platform that allows users to browse available vehicles, make bookings, upload required documents, and manage their rentals all from their mobile device. The app supports iOS, Android, and Web platforms.

## Features

### Core Features
- **User Authentication**: Secure sign-up/sign-in with OTP verification via SMS
- **Car Browsing**: Search and filter available vehicles
- **Booking System**:
  - Real-time availability checking
  - Calendar-based date selection
  - Flexible rental periods (daily, weekly, monthly)
  - Price preview and calculation
- **Payment Processing**: Integrated payment system for rental transactions
- **Document Management**: Upload and manage required documents (license, ID, etc.)
- **Profile Management**: Edit user profile and preferences
- **Location Services**: GPS-based location features
- **Multi-language Support**: Localized content for multiple languages
- **Real-time Updates**: Background sync and notifications

### Technical Features
- **Expo Router**: File-based routing with typed routes
- **Supabase Backend**: Authentication, database, and edge functions
- **State Management**: Zustand for efficient state handling
- **Responsive Design**: Adaptive UI for different screen sizes
- **Dark Mode**: Automatic theme switching based on system preferences
- **Edge-to-Edge Display**: Modern Android edge-to-edge UI

## Tech Stack

### Frontend
- **React Native**: ^0.81.5
- **Expo SDK**: 54.0.22
- **TypeScript**: ~5.9.2
- **Expo Router**: ~6.0.14 (File-based routing)

### Backend & Services
- **Supabase**: Authentication, Database, Edge Functions
- **Async Storage**: Local data persistence

### UI & Styling
- **React Native Reanimated**: Smooth animations
- **Expo Linear Gradient**: Gradient effects
- **Lucide React Native**: Modern icon library
- **React Native Modal**: Custom modals
- **React Native Gesture Handler**: Touch interactions

### State Management
- **Zustand**: ^5.0.7

### Media & Documents
- **Expo Image Picker**: Camera and photo library access
- **Expo Document Picker**: Document selection
- **Expo Image**: Optimized image handling

### Other Features
- **Expo Location**: GPS and location services
- **Expo Background Fetch**: Background updates
- **Expo Web Browser**: In-app browser
- **React Native WebView**: Embedded web content

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI
- iOS Simulator (macOS only) or Android Studio (for Android development)
- Expo Go app (for quick testing on physical devices)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd leagov5
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` (if available)
   - Configure your Supabase credentials (see Configuration section)

## Configuration

The app uses Supabase for backend services. Configuration is managed in `app.json`:

```json
{
  "extra": {
    "EXPO_PUBLIC_SUPABASE_URL": "your-supabase-url",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
    "EXPO_PUBLIC_SUPABASE_FUNCTIONS_URLSend": "your-send-otp-function-url",
    "EXPO_PUBLIC_SUPABASE_FUNCTIONS_URLVeryfiy": "your-verify-otp-function-url"
  }
}
```

Make sure to replace these values with your own Supabase project credentials.

## Running the App

### Development

Start the Expo development server:
```bash
npm start
```

This will open the Expo Developer Tools in your browser. From there, you can:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your physical device

### Platform-Specific Commands

Run on iOS:
```bash
npm run ios
```

Run on Android:
```bash
npm run android
```

Run on Web:
```bash
npm run web
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Project Structure

```
leagov5/
├── app/                      # Main application code (Expo Router)
│   ├── (auth)/              # Authentication screens
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   ├── welcome.tsx
│   │   └── reset/           # Password reset flows
│   ├── (tabs)/              # Tab-based navigation screens
│   ├── screens/             # Additional screens
│   │   ├── Booking.tsx
│   │   ├── Car-details.tsx
│   │   ├── PaymentScreen.tsx
│   │   ├── ProfileEdit.tsx
│   │   └── ...
│   └── _layout.tsx          # Root layout
├── components/              # Reusable components
│   ├── Auth/               # Authentication components
│   ├── booking/            # Booking-related components
│   ├── Home/               # Home screen components
│   ├── CarDetails/         # Car details components
│   ├── Payment/            # Payment components
│   └── ui/                 # Generic UI components
├── hooks/                   # Custom React hooks
│   └── booking/            # Booking-specific hooks
├── store/                   # Zustand state management
│   ├── auth/               # Auth stores
│   ├── useCarDetailsStore.ts
│   ├── useLanguageStore.ts
│   ├── useOTPStore.ts
│   └── useToastStore.ts
├── lib/                     # Utility libraries
│   └── supabase.ts         # Supabase client
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
├── assets/                  # Images, fonts, etc.
├── constants/               # App constants
└── EdgFunctions-for-otp/   # Supabase Edge Functions for OTP

```

## Key Components

### Authentication Flow
- Welcome screen with language selection
- Sign up with phone number
- OTP verification
- Sign in for returning users
- Password reset options (phone/email)

### Booking Flow
1. Browse available cars
2. Select car and view details
3. Choose rental dates and duration
4. Review price preview
5. Upload required documents
6. Complete payment
7. Confirm booking

### State Management

The app uses Zustand for state management with the following stores:
- **useOTPStore**: OTP verification state
- **useCarDetailsStore**: Selected car information
- **useLanguageStore**: Multi-language support
- **useToastStore**: Toast notifications
- **useNavLockStore**: Navigation lock state

## Permissions

### iOS
- Camera access
- Photo library access
- Location (always and when in use)
- Background modes (audio, background-fetch)

### Android
- Camera
- Storage (read/write)
- Media (images/video)
- Internet and network state
- Location (coarse and fine)
- Boot completed receiver
- Wake lock
- Audio recording

## Building for Production

### iOS

1. Configure signing in `eas.json`
2. Build for iOS:
```bash
eas build --platform ios
```

### Android

1. Update version code in `app.json`
2. Build for Android:
```bash
eas build --platform android
```

### Web

Build for web deployment:
```bash
npx expo export:web
```

## Environment Variables

The following environment variables are required:

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `EXPO_PUBLIC_SUPABASE_FUNCTIONS_URLSend`: OTP send function URL
- `EXPO_PUBLIC_SUPABASE_FUNCTIONS_URLVeryfiy`: OTP verify function URL

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
npx expo start --clear
```

**iOS build issues:**
```bash
cd ios && pod install && cd ..
```

**Android build issues:**
```bash
cd android && ./gradlew clean && cd ..
```

**Expo cache issues:**
```bash
npx expo start -c
```

## Support

For issues and questions:
- Create an issue in the repository
- Check Expo documentation: https://docs.expo.dev
- Supabase documentation: https://supabase.com/docs

## License

[Your License Here]

## Version

Current version: 1.0.1

## Credits

Built with:
- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev)
- [Supabase](https://supabase.com)
- [Zustand](https://github.com/pmndrs/zustand)
