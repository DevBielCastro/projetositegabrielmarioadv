# Imagem base oficial do Node.js (Alpine é leve e estável)
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia package.json e package-lock.json (se existir)
COPY package*.json ./

# Instala as dependências de produção de forma limpa, forçando a limpeza do cache primeiro
RUN npm cache clean --force && npm install --only=production

# Copia o restante do código da aplicação para o diretório de trabalho
COPY . .

# Expõe a porta que a aplicação irá usar (definida via PORT ou padrão 8080)
EXPOSE 8080

# Comando para iniciar a aplicação quando o container rodar
CMD ["npm", "start"]