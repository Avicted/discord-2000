# production environment image
FROM node:14.15-buster as production

# update the OS & install ffmpeg
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends ffmpeg

# set the working directory inside the image
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
RUN npm install -g typescript

# Arguments passed from .env -> docker-compose.yaml -> Dockerfile
ARG token
ARG cmdPrefix
ARG enable_presence_updates
ARG presence_text_channel_updates
ARG timezone

# copy the list of dependencies to the working directory
COPY package.json ./
COPY package-lock.json ./

# copy all source code to the working directory
COPY . ./

# install dependencies
RUN npm ci --only=production
