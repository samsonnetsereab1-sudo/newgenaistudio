FROM node:20-bullseye-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "dist/src/opcua-sim.js"]
