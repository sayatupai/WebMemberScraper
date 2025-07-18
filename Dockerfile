# Dockerfile for Railway/Render/Heroku

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

COPY . .

# Build frontend
RUN npm run build

# Build backend secara eksplisit
RUN mkdir -p server/dist && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=server/dist/index.js

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
