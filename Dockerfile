FROM node:latest

EXPOSE 1993

WORKDIR /app

COPY package*.json ./

RUN npm install

ADD . /app

RUN npm run build
CMD npm run start
