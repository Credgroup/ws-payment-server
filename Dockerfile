FROM node:latest

ARG VITE_IMAGE_VERSION
ARG VITE_ENV

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build do projeto antes de rodar
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
