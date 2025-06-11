# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /frontend

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]
