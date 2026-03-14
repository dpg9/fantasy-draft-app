# Stage 1: Build the Frontend
FROM node:20-slim AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Setup the Backend & Final Image
FROM node:20-slim
WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy server code
COPY server/ ./server/

# Copy built frontend from Stage 1 to server's public folder
COPY --from=client-builder /app/client/dist ./server/public

# Create data and uploads directories
RUN mkdir -p /app/server/data /app/server/uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Expose the port
EXPOSE 5001

# Start the server
CMD ["node", "server/server.js"]
