# Use the official Node.js image as the base
FROM node:20-bookworm-slim

# Install Python 3, SQLite3, and base utilities
RUN apt-get update && apt-get install -y python3 sqlite3 && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package description files
COPY package*.json ./

# Install node dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Compile the Vite client assets and bundle the Express proxy server
RUN npm run build

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the server port
EXPOSE 3000

# Start Express which will spawn backend.py successfully
CMD ["npm", "start"]
