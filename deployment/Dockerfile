# Build phase
FROM node:13.12-alpine AS build

RUN apk add --update --no-cache python make g++

WORKDIR /app
COPY ./package*.json ./

RUN npm set progress=false && npm config set depth 0
RUN npm ci

COPY . .

RUN npm run build


# Deployment phase
FROM nginxinc/nginx-unprivileged:mainline-alpine

COPY deployment/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/build/ /usr/share/nginx/html/
