# usar node versao 18
FROM node:18-alpine

# criar diretorio da aplicacao
WORKDIR /app

# copiar package.json primeiro (para cache das dependencias)
COPY server/package*.json ./

# instalar dependencias
RUN npm install

# copiar arquivos do servidor
COPY server/ ./

# copiar cliente para pasta public
COPY client/ ./public/

# expor porta 3000
EXPOSE 3000

# comando para iniciar a aplicacao
CMD ["npm", "start"]
