
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
     
RUN npm install --only=production

FROM node:20-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY src ./src
COPY package*.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN mkdir -p /app/uploads && \
    chown -R nodejs:nodejs /app/uploads && \
    chmod 755 /app/uploads

USER nodejs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "node"]
CMD ["src/app.js"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
