FROM node:14.16.1 AS development

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

RUN npm install -g @nestjs/cli

COPY . ./

EXPOSE $PORT
