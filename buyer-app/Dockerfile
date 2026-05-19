# ----- Stage 1: builder -----
FROM node:24-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:5000
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_RAZORPAY_KEY=""
ENV VITE_API_URL=$VITE_API_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_RAZORPAY_KEY=$VITE_RAZORPAY_KEY

COPY package.json package-lock.json ./
COPY buyer-app/package.json ./buyer-app/

RUN npm ci --workspace=@store/buyer-app --include-workspace-root=false

COPY buyer-app/tsconfig.json buyer-app/vite.config.ts buyer-app/index.html ./buyer-app/
COPY buyer-app/src ./buyer-app/src

RUN npm run build --workspace=@store/buyer-app

# ----- Stage 2: runner -----
# nginx-unprivileged is the official nginx image pre-configured to run as the
# non-root `nginx` user on port 8080, with /var/cache/nginx, /var/run, and
# /etc/nginx/conf.d/ writable by that user. Avoids the permission-denied
# failures of the standard nginx:alpine image when USER nginx is set.
FROM nginxinc/nginx-unprivileged:alpine AS runner

COPY buyer-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/buyer-app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
