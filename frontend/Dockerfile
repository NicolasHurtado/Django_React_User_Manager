FROM node:16-alpine

WORKDIR /app

# Asegurarnos de que existen los directorios necesarios
RUN mkdir -p /app/public

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm install

# Copiar el código fuente
COPY . .

EXPOSE 3000

CMD ["npm", "start"] 