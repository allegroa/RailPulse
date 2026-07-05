FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production

# Copy app
COPY . .

# Ensure uploads directory exists
RUN mkdir -p /app/uploads

# Generate Prisma client if schema exists
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate || true; fi

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
