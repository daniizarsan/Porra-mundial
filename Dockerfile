# Dockerfile para Porra Mundial 2026
FROM node:20-alpine AS base
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare yarn@4.13.0 --activate

# ---------- deps ----------
FROM base AS deps
WORKDIR /build

# Yarn 4 config compatible con Docker (sin rutas del host)
RUN echo 'nodeLinker: node-modules' > .yarnrc.yml

COPY nextjs_space/package.json ./package.json
COPY docker/yarn.lock.docker ./yarn.lock
RUN yarn install --network-timeout 600000

# ---------- builder ----------
FROM base AS builder
WORKDIR /build

RUN echo 'nodeLinker: node-modules' > .yarnrc.yml

COPY --from=deps /build/node_modules ./node_modules
COPY --from=deps /build/yarn.lock ./yarn.lock
COPY nextjs_space/ ./

# Parche: el schema de Prisma tiene output absoluto del servidor de Abacus
# y solo binaryTarget ARM64. Lo corregimos para Docker multi-arch.
RUN sed -i \
    -e '/^[[:space:]]*output[[:space:]]*=/d' \
    -e 's/binaryTargets.*/binaryTargets = ["native", "linux-musl-openssl-3.0.x", "linux-musl-arm64-openssl-3.0.x"]/' \
    prisma/schema.prisma

RUN yarn prisma generate

# DATABASE_URL dummy para que Next.js pueda recopilar páginas sin error.
# No se conecta realmente (prisma solo valida el formato al instanciar).
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV NEXT_OUTPUT_MODE=standalone
RUN yarn build

# ---------- runner ----------
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

# Standalone output. outputFileTracingRoot = parent de /build = /
# Así que la app queda en .next/standalone/build/
COPY --from=builder /build/.next/standalone/build ./

# Assets estáticos y públicos
COPY --from=builder /build/.next/static ./.next/static
COPY --from=builder /build/public ./public

# Prisma client generado
COPY --from=builder /build/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /build/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /build/prisma/schema.prisma ./prisma/schema.prisma

EXPOSE 3000
CMD ["node", "server.js"]
