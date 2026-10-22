FROM node:24-slim AS builder

LABEL maintainer="info@redpencil.io"

RUN npm config set ignore-scripts true
RUN npm i -g corepack@0.36
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm i --frozen-lockfile
COPY . .
RUN pnpm build

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/dist /data
