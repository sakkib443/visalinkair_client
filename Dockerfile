# syntax=docker/dockerfile:1

# ============================================================
# Aerovista Frontend — production image (Next.js 16, App Router)
# Uses Next.js "standalone" output for a small runtime image.
# ============================================================

# ---------- Stage 1: build ----------
FROM node:22-slim AS builder
WORKDIR /app

# NEXT_PUBLIC_* vars are inlined into the browser bundle at BUILD time,
# so they MUST be provided as build args (not just runtime env). Most of
# the app reads NEXT_PUBLIC_API_URL; a few files read NEXT_PUBLIC_BACKEND_URL,
# so wire up both to the same backend URL.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Optional: where the /uploads/* rewrite proxies to. Defaults to
# NEXT_PUBLIC_API_URL (see next.config.mjs); set this to the backend's
# internal Docker-network URL to keep image traffic off the public proxy.
# It must be a BUILD arg — Next bakes rewrite destinations into the
# standalone build, so a runtime-only value would be ignored.
ARG INTERNAL_API_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL

ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
# --include=dev forces devDependencies (tailwind, eslint-config-next, etc.)
# to install even when NODE_ENV=production is injected at build time.
RUN npm ci --include=dev

COPY . .
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Bind to all interfaces so Coolify's reverse proxy can reach the container.
ENV HOSTNAME=0.0.0.0

# Copy the standalone server, static assets, and public files.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

EXPOSE 3000
USER node
CMD ["node", "server.js"]
