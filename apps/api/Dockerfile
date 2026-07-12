# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages packages/

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --filter api...

# Copy source and build
COPY . .
RUN pnpm --filter api build

# Production Stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 4000

COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/main"]
