# Defines the image for the service1

# Fetch the Node Docker image with tag "20" from Docker Hub
FROM node:20
# Workdir
WORKDIR /usr/src/app
# Copy the the application code into the working directory
COPY . .
# Install dependencies
RUN npm install
EXPOSE 8001
# Build the application and start the service
ENTRYPOINT npm run build && npm start