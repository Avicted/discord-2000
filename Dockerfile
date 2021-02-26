# production environment image
FROM node:14.15-buster as production

# update the OS & install ffmpeg
RUN apt-key adv --refresh-keys --keyserver keyserver.ubuntu.com && apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends ffmpeg postgresql-client build-essential libssl-dev libffi-dev python3-dev python3-pip python3-setuptools

COPY /bin/wait-for-it.sh /usr/wait-for-it.sh
RUN chmod +x /usr/wait-for-it.sh

# set the working directory inside the image
WORKDIR /app

RUN chown -R node:node /app
USER node

# Arguments passed from .env -> docker-compose.yaml -> Dockerfile
ARG TOKEN
ARG CMD_PREFIX
ARG ENABLE_PRESENCE_UPDATES
ARG PRESENCE_TEXT_CHANNEL_UPDATES
ARG TIMEZONE


# copy the list of dependencies to the working directory
COPY package.json ./
COPY package-lock.json ./

# copy all source code to the working directory
COPY . ./

# install dependencies
RUN npm install

# Install python requirements for spawnable processes
RUN pip3 install --user -r requirements.txt

