# Stage 1 - Build
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies and build
COPY package*.json ./
RUN npm ci
COPY . . 

RUN IGNORE_ESLINT_ERRORS=true npm run build


# Stage 2 - Production Image
FROM node:18-alpine
WORKDIR /app

# Only copy necessary files for runtime
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
