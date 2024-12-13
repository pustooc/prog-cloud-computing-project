FROM alpine
RUN apt-get update
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
RUN nvm install 19.1.0
RUN npm install -g npm@8.19.3
COPY . .
WORKDIR .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]