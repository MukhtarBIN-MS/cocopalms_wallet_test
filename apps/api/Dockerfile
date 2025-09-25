
  # ---------- Base with pnpm ----------
    FROM node:20-alpine AS base
    ENV PNPM_HOME="/pnpm"
    ENV PATH="$PNPM_HOME:$PATH"
    RUN corepack enable
    
    # ---------- Dependencies (cache-friendly) ----------
    FROM base AS deps
    WORKDIR /app
    # Root/workspace manifests
    COPY pnpm-workspace.yaml* package.json pnpm-lock.yaml* ./
    # App manifest so pnpm can resolve workspace references
    COPY apps/api/package.json apps/api/
    # Prefetch tarballs to improve caching
    RUN pnpm fetch
    
    # ---------- Build (compile TS) ----------
    FROM base AS build
    WORKDIR /app
    COPY pnpm-workspace.yaml* package.json pnpm-lock.yaml* ./
    COPY tsconfig.base.json ./
    COPY apps/api ./apps/api
    # Install all deps based on lockfile, then build
    RUN pnpm install --frozen-lockfile
    RUN pnpm -C apps/api build
    
    # ---------- Prod deps (prune to production) ----------
    FROM base AS proddeps
    WORKDIR /app
    COPY pnpm-workspace.yaml* package.json pnpm-lock.yaml* ./
    COPY apps/api/package.json apps/api/
    # Install only production deps for the API package
    RUN pnpm install --frozen-lockfile --prod --filter ./apps/api...
    
    # ---------- Runtime (final image) ----------
    FROM node:20-alpine AS runtime
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=4000
    
    # Copy compiled app
    COPY --from=build    /app/apps/api/dist         ./dist
    # Copy API's package.json
    COPY --from=build    /app/apps/api/package.json ./package.json
    # Copy production node_modules (both root and api-local)
    COPY --from=proddeps /app/node_modules          ./node_modules
    COPY --from=proddeps /app/apps/api/node_modules ./apps/api/node_modules
    
    # Optional: healthcheck tooling & non-root user
    RUN apk add --no-cache curl
    RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp
    USER nodeusr
    
    EXPOSE 4000
    HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
      CMD curl -fsS "http://localhost:${PORT}/healthz" || exit 1
    
    # Start app
    CMD ["node", "dist/server.js"]
    