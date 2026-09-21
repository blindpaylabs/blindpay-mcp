# Stdio MCP server image for the Docker MCP Registry (docker/mcp-registry).
# Runtime config: BLINDPAY_API_KEY (required), BLINDPAY_INSTANCE_ID,
# BLINDPAY_MCP_PROFILE (full | readonly).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm ci --no-audit --no-fund && npm run build && npm prune --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
USER node
ENTRYPOINT ["node", "build/index.js"]
