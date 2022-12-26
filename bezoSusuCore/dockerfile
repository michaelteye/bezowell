# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app
EXPOSE 7200

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN yarn install

# Bundle app source
COPY . .

# install rimraf
RUN yarn add rimraf

# Creates a "dist" folder with the production build
RUN yarn build

# Start the server using the production build
CMD [ "node", "build/src/main.js" ]

