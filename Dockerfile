# Stage 1: Build the Frontend
FROM node:20-slim AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Setup the Backend
FROM node:20-slim
WORKDIR /app/server

# Install server dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy server code directly into the workdir
COPY server/ ./

# Copy built frontend to the public folder inside the server workdir
COPY --from=client-builder /app/client/dist ./public

# Ensure directories exist
RUN mkdir -p data uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Expose the port
EXPOSE 5001

# Start the server
CMD ["node", "server.js"]
