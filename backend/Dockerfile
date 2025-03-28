# Use Node.js as base image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the port NestJS runs on
EXPOSE 3000

# Start the backend
CMD ["npm", "run", "start"]
