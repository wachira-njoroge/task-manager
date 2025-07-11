# 1. Pull Node.js image
FROM node:20-slim AS build

# 2. Set working directory
WORKDIR /app

# 3. Copy the package.json and package-lock.json files
COPY package*.json ./

RUN apt-get update && apt-get install -y openssl

# Install dependencies
RUN npm install

# 4. Copy application files
COPY . .

# 5. Run the migrations on the prod environment
RUN npx prisma migrate deploy

# 6. Generate Prisma client
RUN npx prisma generate

# 7. Build TypeScript code
RUN npm run build

# 8. Expose port the app will use
EXPOSE 8090

# 8. Start app
CMD ["node", "dist/index.js"]