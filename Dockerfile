# production environment image
FROM node:16.11-buster as production

# update the OS & install ffmpeg
RUN apt-key adv --refresh-keys --keyserver keyserver.ubuntu.com && apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends ffmpeg postgresql-client build-essential libssl-dev libffi-dev

USER root
RUN mkdir /app
RUN chown -R node:node /app
USER node

# set the working directory inside the image
WORKDIR /app

# Arguments passed from .env -> docker-compose.yaml -> Dockerfile
ARG TOKEN
ARG CMD_PREFIX
ARG TIMEZONE


# copy the list of dependencies to the working directory
COPY package.json ./
COPY package-lock.json ./

# copy all source code to the working directory
COPY . ./

USER root
RUN chown -R node:node /app
USER node

# install dependencies
RUN npm install
