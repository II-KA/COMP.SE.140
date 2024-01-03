# Defines the image for the monitor

# Fetch the Node Docker image with tag "20" from Docker Hub
FROM node:20
# Workdir
WORKDIR /usr/src/app
# Copy the the application code into the working directory
COPY . .
# Install dependencies
RUN npm install
EXPOSE 8002
# make wait-for-it.sh an executable
RUN ["chmod", "+x", "./src/utils/wait-for-it.sh"]
# Run the 'wait-for-it.sh' script to check when the port used by rabbitmq 
# has opened i.e., the rabbitmq service has started successfully. 
# Timeout after 20sec, if port has not opened.
# If the port is open within the timeout, build the application and start the monitor
# If the port is not open within the timeout, do not start the monitor
ENTRYPOINT ./src/utils/wait-for-it.sh $RABBITMQ_NAME:$RABBITMQ_PORT --timeout=20 --quiet --strict -- npm run build && npm start