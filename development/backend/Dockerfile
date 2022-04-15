FROM node:12-alpine
WORKDIR /backend
COPY src/ ./src
COPY package.json package-lock.json ./
RUN mkdir file
RUN mkdir file/static
RUN npm ci

# ENTRYPOINT ["node", "src/index.js"]
CMD ["node", "src/index.js"]
