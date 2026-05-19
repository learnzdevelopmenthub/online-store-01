# ----- Stage 1: builder -----
FROM node:24-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
COPY admin-app/package.json ./admin-app/

RUN npm ci --workspace=@store/admin-app --include-workspace-root=false

COPY admin-app/tsconfig.json admin-app/vite.config.ts admin-app/index.html ./admin-app/
COPY admin-app/src ./admin-app/src

RUN npm run build --workspace=@store/admin-app

# ----- Stage 2: runner -----
# nginxinc/nginx-unprivileged is the official nginx image pre-configured to run
# as the non-root `nginx` user on port 8080, with /var/cache/nginx, /var/run,
# and /etc/nginx/conf.d/ writable by that user. Avoids the permission-denied
# failures of the standard nginx:alpine image when running as non-root.
FROM nginxinc/nginx-unprivileged:alpine AS runner

COPY admin-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/admin-app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
