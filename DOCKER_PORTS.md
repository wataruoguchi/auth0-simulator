# Docker Compose Port Configuration

This project supports flexible port configuration through environment variables. You can choose any available ports from outside the Docker network without modifying the `docker-compose.yml` file.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PORT` | `3000` | External port for the main application |
| `AUTH0_PORT` | `4400` | External port for the Auth0 simulator |

## Usage Examples

### Using Default Ports

```bash
docker-compose up
```

- App: http://localhost:3000
- Auth0 Simulator: https://localhost:4400

### Using Custom Ports

```bash
APP_PORT=8080 AUTH0_PORT=8440 docker-compose up
```

- App: http://localhost:8080
- Auth0 Simulator: https://localhost:8440

### Using a .env File

Create a `.env` file in the project root:

```bash
APP_PORT=8080
AUTH0_PORT=8440
```

Then run:

```bash
docker-compose up
```

### Running E2E Tests with Custom Ports

```bash
APP_PORT=8080 AUTH0_PORT=8440 docker-compose up --build e2e
```

## Important Notes

1. **Internal Ports**: The internal container ports (3000 for app, 4400 for auth0-simulator) remain fixed and should not be changed.

2. **Port Conflicts**: Make sure the external ports you choose are not already in use on your system.

3. **E2E Tests**: The E2E tests use `network_mode: host`, so they will automatically use the external ports you specify.

## Troubleshooting

If you encounter port conflicts:

```bash
# Check what's using a port
lsof -i :3000
lsof -i :4400

# Kill processes using those ports
kill -9 <PID>
```
