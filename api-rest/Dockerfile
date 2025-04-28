# Dockerfile for nest app

FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Create proto directory
RUN mkdir -p proto

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose ports - API, Notifications gRPC, and Extracts gRPC
EXPOSE 3000 50051 50052

# Start the application
CMD ["node", "dist/main"]

