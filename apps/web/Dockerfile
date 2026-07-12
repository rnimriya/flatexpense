# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages packages/

RUN npm install -g pnpm
RUN pnpm install --filter web...

COPY . .
RUN pnpm --filter web build

# Production Stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/apps/web/next.config.mjs ./
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
