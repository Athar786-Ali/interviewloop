# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

# Accept API URL as build arg (defaults to empty string = same-origin)
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# serve -s = single-page app mode (rewrites all routes to index.html for React Router)
CMD ["serve", "-s", "dist", "-l", "3000"]
