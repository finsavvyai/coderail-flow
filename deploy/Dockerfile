FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source files
COPY src ./src
COPY wrangler.toml ./
COPY tsconfig.json ./

# Build
RUN pnpm build

# Expose port for local development
EXPOSE 8787

# Start development server
CMD ["pnpm", "dev"]
