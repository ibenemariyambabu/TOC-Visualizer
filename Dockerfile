# Multi-stage production build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install all dependencies (workspaces)
RUN npm ci

# Copy full source
COPY . .

# Build both backend and frontend
RUN npm run build

# Runner stage (lean production image)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY backend/package*.json ./backend/

# Install only production dependencies for backend
RUN npm ci --omit=dev --workspace=backend

# Copy compiled backend and frontend distribution
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

CMD ["node", "backend/dist/server.js"]
