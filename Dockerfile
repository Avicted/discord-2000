# production environment image
FROM node:15.2.1 as production

# update the OS & install ffmpeg
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends ffmpeg

# set the working directory inside the image
WORKDIR /app

# Arguments passed from .env -> docker-compose.yaml -> Dockerfile
ARG token
ARG cmdPrefix

# copy the list of dependencies to the working directory
COPY package.json ./
COPY package-lock.json ./

# install dependencies
RUN npm install

# copy all source code to the working directory
COPY . ./

# run the start script in package.json
RUN npm run start