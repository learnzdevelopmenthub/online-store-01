# ----- Stage 1: builder -----
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

RUN npm ci --workspace=@store/backend --include-workspace-root=false

COPY backend/tsconfig.json backend/tsconfig.build.json ./backend/
COPY backend/src ./backend/src
RUN npm run build --workspace=@store/backend

# ----- Stage 2: runner -----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci --workspace=@store/backend --include-workspace-root=false --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 5000
CMD ["node", "backend/dist/index.js"]
