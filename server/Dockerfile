FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:24-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

ENTRYPOINT ["node", "dist/src/server.js"]
CMD ["resume"]
