FROM node:12
WORKDIR /usr/src/app

COPY package*.json yarn.lock aspecto.json ./

RUN yarn install
COPY . .

CMD [ "yarn", "start" ]
