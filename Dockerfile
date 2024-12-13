FROM alpine
# Update alpine's package manager
RUN apk update
# Install environment dependencies
RUN apk add --no-cache \
bash \
curl \
build-base \
nodejs \
npm
RUN npm install -g npm@8.19.3
# File transfer to the container
WORKDIR /src
COPY . .
# Install app dependencies
RUN npm install
# Running the app
EXPOSE 3000
CMD ["npm", "start"]