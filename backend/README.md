# Backend API

This is the Hono-based backend API for the PoC E2E with Auth0 project.

## Overview

The backend provides:

- **JWT token verification**

## Features

- Protected API routes with JWT verification

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

The backend uses the following environment variables:

- `PORT` - Server port (default: 3000)
- `AUTH0_DOMAIN` - Auth0 domain for JWKS verification

## API Endpoints

### Public Endpoints

- `GET /` - Serve the UI

### Protected Endpoints

- `GET /api/verify` - Returns the JWT payload (protected)

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```txt
Authorization: Bearer <jwt_token>
```
