# 1. Pull Node.js image
FROM node:20-slim AS build

RUN apt-get install -y openssl

# 2. Set working directory
WORKDIR /app

# 3. Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# 4. Copy application files
COPY . .

# 5. Generate Prisma client
RUN npx prisma generate

# 6. Build TypeScript code
RUN npm run build

# 7. Expose port 5200
EXPOSE 8090

# 8. Start app
CMD ["node", "dist/index.js"]