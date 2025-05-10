# IndoQuran Web Deployment

This ## Docker Images

- Web: Node.js 24 Alpine (security hardened)
- MySQL: MySQL 8.0 with UTF-8 support
- Redis: Redis 7 Alpinetory contains all files related to deploying the IndoQuran Web application with Docker.

## Directory Structure

```
deploy/
├── Dockerfile              # Multi-stage build for the NextJS application
├── docker-compose.yml      # Main Docker Compose configuration
├── docker-compose.override.yml  # Development-specific overrides
├── .env.production.example # Template for production environment variables
├── .env.local.example      # Template for local development environment variables
├── deploy.sh               # Production deployment script
├── dev.sh                  # Development environment startup script
├── backup-db.sh            # Database backup script
├── monitor.sh              # Container monitoring and management script
├── manage-volumes.sh       # Docker volume management script
└── mysql-init/            # MySQL initialization scripts
    └── 01-schema.sql      # Database schema
```

## Usage

All scripts should be run from within this directory using the `docker.sh` script.

## Environment Files

Create these files before deployment:

1. `.env.local` - For local development (copy from `.env.local.example`)
2. `.env.production` - For production deployment (copy from `.env.production.example`)

## Docker Images

- Web: Node.js 20.11 Alpine 3.19 with NextJS application (security hardened)
- MySQL: MySQL 8.0 with UTF-8 support
- Redis: Redis 7 Alpine

## Security Features

The Docker image includes several security enhancements:

- Uses a specific Node.js version to avoid vulnerabilities in generic tags
- Implements dumb-init to handle processes properly and prevent zombie processes
- Runs security updates during build
- Runs as a non-root user (nextjs)
- Implements Docker healthchecks
- Includes a security scanning script (scan-security.sh)

## Volumes

- `mysql-data`: Persistent storage for MySQL database
- `redis-data`: Persistent storage for Redis data

## Networks

- `indoquran-network`: Bridge network for container communication

## Security Scanning

The `scan-security.sh` script can be used to scan the Docker image for vulnerabilities:

```bash
./scan-security.sh [--build]
```

Options:
- `--build`: Build the image before scanning

This script uses Docker Scout to identify any security vulnerabilities in the images and will fail if critical vulnerabilities are found.
