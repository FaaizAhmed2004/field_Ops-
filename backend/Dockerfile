# Use Node LTS
FROM node:22-alpine

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of code
COPY . .

# Expose backend port (change if needed)
EXPOSE 5000

# Start server
CMD ["npm", "run", "dev"]