FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install Node Packages
RUN npm install

# Copying app source
COPY src/ src/

CMD [ "npm", "run", "dev" ]