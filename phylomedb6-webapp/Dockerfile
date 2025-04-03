FROM node:22-alpine

RUN apk update
RUN apk add python3 make g++ sqlite sqlite-dev

WORKDIR /phylomedb6-webapp
COPY . .

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

RUN npm install

EXPOSE 3000

RUN cp /phylomedb6-webapp/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
