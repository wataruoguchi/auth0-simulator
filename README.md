# PoC E2E with Auth0

## Setup

1. Copy the environment file and configure your Auth0 settings:

```sh
cp .env.example .env
# Edit .env with your actual Auth0 domain and other settings
```

2. Start the application:

```sh
docker-compose up -d
```

## Commands

```sh
# Start the application
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs

# Rebuild and start
docker-compose up --build -d

# All in one
# alias dc="docker-compose"
dc rm --stop -f && dc build --no-cache && dc up
```

## Environment Variables

The frontend and the backend apps require the environment variables configured in `.env`. `docker-compose.yml` takes some variables as well. Please maintain all the `.env` files beside `.env.example`.
