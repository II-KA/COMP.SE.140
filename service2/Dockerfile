# Defines the image for the service1

# Fetch the Python Docker image with tag "3" from Docker Hub
FROM python:3
# Workdir
WORKDIR /usr/src/app
# Copy the the application code into the working directory
ADD server.py .
# Install dependencies
RUN pip install --no-cache-dir python-dotenv
EXPOSE 8000
# Start the service, -u option for printing logs
ENTRYPOINT python3 -u server.py