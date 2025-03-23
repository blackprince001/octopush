# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy all files
COPY . .

# Set environment variables for the build stage
ARG VITE_FILE_SERVER_API
ENV VITE_FILE_SERVER_API=$VITE_FILE_SERVER_API

# Build the app
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built files from build stage to nginx serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Command to run when container starts
CMD ["nginx", "-g", "daemon off;"]