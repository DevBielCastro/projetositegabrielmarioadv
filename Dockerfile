# Imagem base oficial do Node.js (Alpine é leve)
FROM node:slim-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia package.json e package-lock.json (se existir)
# Isso aproveita o cache do Docker: se esses arquivos não mudarem,
# as dependências não serão reinstaladas em builds subsequentes.
COPY package*.json ./

# Instala apenas as dependências de produção de forma limpa e consistente
RUN npm ci --omit=dev
# Alternativa se npm ci não funcionar ou para versões mais antigas do npm:
# RUN npm install --only=production

# Copia o restante do código da aplicação para o diretório de trabalho
COPY . .

# O Google Cloud Run (e outros) injetará a variável de ambiente PORT.
# Sua aplicação (server.js) já está configurada para usar process.env.PORT.
# EXPOSE 3000 # Esta linha é mais informativa para o Docker; Cloud Run usa PORT.

# Comando para iniciar a aplicação quando o container rodar
# Usar "npm start" é uma boa prática se seu package.json tiver o script "start".
CMD [ "npm", "start" ]
# Alternativamente, se você não tiver o script "start" ou preferir:
# CMD [ "node", "server.js" ]