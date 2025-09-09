# Frontend Application

This is the React frontend application for the PoC E2E with Auth0 project.

## Overview

The frontend is built with:

- **React** with TypeScript
- **Vite** for fast development and building
- **Auth0 React SDK** for authentication

## Features

- User authentication with Auth0
- TypeScript support

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

The frontend uses the following environment variables:

- `VITE_AUTH0_DOMAIN` - Auth0 domain
- `VITE_AUTH0_CLIENT_ID` - Auth0 client ID
- `VITE_AUTH0_AUDIENCE` - Auth0 API audience
- `VITE_API_URL` - Backend API URL

## Authentication Flow

1. User clicks "Login" button
2. Redirects to Auth0 simulator login page
3. User enters credentials
4. Simulator generates JWT tokens
5. User is redirected back to app
6. App verifies tokens and shows user profile
