FROM node:20-slim

RUN npm install -g pnpm@10.33.0

WORKDIR /app

COPY . .

RUN pnpm install --no-frozen-lockfile

RUN pnpm --filter @workspace/launchit run build

RUN pnpm --filter @workspace/api-server run build

EXPOSE 3001

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]