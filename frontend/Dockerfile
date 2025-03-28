# Use Node.js as base image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set necessary environment variables for hot reloading
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Expose the Next.js port
EXPOSE 5173

# Set correct permissions for Next.js
RUN chmod -R 777 /app

# Start Next.js in development mode
CMD ["npm", "run", "dev", "--", "-p", "5173", "-H", "0.0.0.0"]
