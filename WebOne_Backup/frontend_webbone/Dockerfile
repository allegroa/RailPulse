# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Preview stage — we can run `vite preview` to serve built files
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app .
EXPOSE 5173
ENV NODE_ENV=production
CMD ["npm", "run", "preview"]
