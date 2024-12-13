FROM alpine
RUN apk update && apk add --no-cache \
bash \
curl \
build-base
RUN curl -sL https://deb.nodesource.com/setup_19.x | bash - && \
apk add --no-cache nodejs=19.1.0-r0 npm=8.19.3-r0
COPY . .
WORKDIR .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]