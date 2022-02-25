FROM node:16-alpine

WORKDIR /app
COPY package*.json ./

RUN ls -l

RUN npm install

COPY . .

EXPOSE 8082

ENTRYPOINT ["sh", "entrypoint.sh"]
