FROM alpine
RUN apk update
RUN apk add --no-cache \
bash \
curl \
build-base \
nodejs \
npm
RUN npm install -g npm@8.19.3
COPY . .
WORKDIR .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]