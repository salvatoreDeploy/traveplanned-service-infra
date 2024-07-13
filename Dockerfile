FROM node:20 AS dependencies

WORKDIR /usr/src/app

COPY package.json ./
# COPY ./prisma ./usr/src/app/prisma

RUN npm install 

FROM dependencies AS biuld

WORKDIR /usr/src/app

COPY . .

COPY --from=dependencies /usr/src/app/node_modules ./node_modules

RUN npm run build

FROM node:20-alpine3.19 AS deploy

WORKDIR /usr/src/app

COPY --from=biuld /usr/src/app/dist ./dist
COPY --from=biuld /usr/src/app/node_modules ./node_modules
COPY --from=biuld /usr/src/app/package.json ./package.json
COPY --from=biuld /usr/src/app/prisma ./prisma

RUN npx prisma generate

EXPOSE 3333

CMD [ "npm", "run", "start:prod" ]