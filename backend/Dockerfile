FROM node:20-alpine AS builder

WORKDIR /app

COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

RUN cd shared && npm ci --silent
RUN cd backend && npm ci --silent

COPY shared ./shared
COPY backend ./backend

RUN cd shared && npm run build
RUN cd backend && npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev --silent

COPY --from=builder /app/backend/dist   ./backend/dist
COPY backend/drizzle                    ./backend/drizzle

WORKDIR /app/backend

EXPOSE 3000

CMD ["sh", "-c", "npm run drizzle:migrate && node dist/main.js"]
