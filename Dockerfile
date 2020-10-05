FROM node:12
WORKDIR /usr/src/app

COPY package*.json yarn.lock aspecto.json ./

RUN yarn install
COPY . .
RUN cp skip-jaeger.js node_modules/@aspecto/opentelemetry/dist/src/index.js

CMD [ "yarn", "start" ]
