FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server source code
COPY . .

# Expose the port Fly.io will use
EXPOSE 8080

# Set default port for Fly.io
ENV PORT=8080

# Start the server
CMD ["node", "src/index.js"]
