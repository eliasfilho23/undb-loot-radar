FROM node:20-alpine AS builder

WORKDIR /app

COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY shared ./shared
COPY backend ./backend

RUN cd backend && npx prisma generate
RUN cd backend && npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma
COPY backend/prisma ./backend/prisma

WORKDIR /app/backend

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
