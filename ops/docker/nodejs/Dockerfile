FROM node:22-bullseye AS base

ARG UNAME=dev
ARG DOCKER_USER_ID
ARG DOCKER_GROUP_ID


ENV NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN \
    PUBLIC_APPLICATION_ID=$PUBLIC_APPLICATION_ID \
    PUBLIC_CLIENT_TOKEN=$PUBLIC_CLIENT_TOKEN

# Packages (includes Playwright dependencies)
RUN apt-get update && apt-get install -y --no-install-recommends \
    htop libcups2 libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 \
    libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0 libxshmfence1 xvfb gosu \
    psmisc \
  && rm -rf /var/lib/apt/lists/*

# User with UID/GID from host (for volume permissions in dev)
RUN groupadd -g "$DOCKER_GROUP_ID" -o "$UNAME" \
 && useradd -m -u "$DOCKER_USER_ID" -g "$DOCKER_GROUP_ID" -o -s /bin/bash "$UNAME"

WORKDIR /app

# Install dependencies (uses layer cache)
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Install playwright (deps + browsers)
ENV PLAYWRIGHT_BROWSERS_PATH=/home/$UNAME/.cache/ms-playwright
RUN npx playwright install --with-deps chromium

# Entrypoint script
COPY ./ops/docker/nodejs/entrypoint.sh /opt/entrypoint.sh
RUN chmod +x /opt/entrypoint.sh && chown -R $DOCKER_USER_ID:$DOCKER_GROUP_ID /app

USER $UNAME
ENTRYPOINT ["bash", "/opt/entrypoint.sh"]