# syntax=docker/dockerfile:1

FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_WINGET_API_BASE
ARG NEXT_PUBLIC_WINGET_API_KEY
ARG NEXT_PUBLIC_WINGET_API_SECRET

ENV NODE_ENV=production \
    STANDALONE_BUILD=true \
    NEXT_PUBLIC_WINGET_API_BASE=${NEXT_PUBLIC_WINGET_API_BASE} \
    NEXT_PUBLIC_WINGET_API_KEY=${NEXT_PUBLIC_WINGET_API_KEY} \
    NEXT_PUBLIC_WINGET_API_SECRET=${NEXT_PUBLIC_WINGET_API_SECRET}

RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
