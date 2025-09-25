# ---------- Base with pnpm ----------
    FROM node:20-alpine AS base
    ENV PNPM_HOME="/pnpm"
    ENV PATH="$PNPM_HOME:$PATH"
    RUN corepack enable
    
    # ---------- Install deps (cached) ----------
    FROM base AS deps
    WORKDIR /app
    COPY pnpm-workspace.yaml* package.json pnpm-lock.yaml* ./
    COPY apps/web/package.json apps/web/
    RUN pnpm fetch
    
    # ---------- Build ----------
    FROM base AS build
    WORKDIR /app
    COPY pnpm-workspace.yaml* package.json pnpm-lock.yaml* ./
    COPY apps/web ./apps/web
    RUN pnpm install --frozen-lockfile
    ENV NEXT_TELEMETRY_DISABLED=1
    RUN pnpm -C apps/web build
    
    # ---------- Runtime ----------
    FROM node:20-alpine AS runtime
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=3000
    ENV NEXT_TELEMETRY_DISABLED=1
    COPY --from=build /app/apps/web/.next/standalone ./
    COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
    COPY --from=build /app/apps/web/public ./apps/web/public
    RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp
    USER nodeusr
    EXPOSE 3000
    CMD ["node", "apps/web/server.js"]
    