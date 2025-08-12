# Use uma imagem base do Node.js com a versão desejada (por exemplo, 14)
FROM node:latest

ARG VITE_IMAGE_VERSION
ARG VITE_ENV

# Crie um diretório de trabalho dentro da imagem
WORKDIR /app

# Copie o arquivo package.json e package-lock.json para o diretório de trabalho na imagem
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie todos os arquivos do diretório atual para o diretório de trabalho na imagem
COPY . .

# Expõe a porta que a sua aplicação Node.js está escutando (provavelmente a mesma que você usa localmente)
EXPOSE 3000

# Comando para iniciar a sua aplicação (utilizando nodemon com ts-node)
CMD ["npm", "start"]