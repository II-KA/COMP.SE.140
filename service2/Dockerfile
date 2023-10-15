# Defines the image for the service1

# Fetch the Python Docker image with tag "3" from Docker Hub
FROM python:3
# Workdir
WORKDIR /usr/src/app
# Copy the the application code into the working directory
COPY . .
# Install dependencies
RUN pip install --no-cache-dir python-dotenv pika
EXPOSE 8000
# Run the 'wait_for_it.sh' script to check when the port used by rabbitmq 
# has opened i.e., the rabbitmq service has started successfully. 
# Timeout after 20sec, if port has not opened.
# If the port is open within the timeout, start the service (-u option for printing logs)
# If the port is not open within the timeout, do not start the service
ENTRYPOINT ./src/utils/wait-for-it.sh $RABBITMQ_NAME:$RABBITMQ_PORT --timeout=20 --quiet --strict -- python3 -u ./src/service2.py