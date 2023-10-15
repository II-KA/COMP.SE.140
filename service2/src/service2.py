from http.server import HTTPServer
from dotenv import load_dotenv
from request_handler import Handler
from consumer import Consumer
import functools
import sys
import threading
import os
import pika
import time

load_dotenv()

HOST_NAME = "0.0.0.0"
SERVER_PORT = int(os.getenv('SERVICE2_PORT'))
RABBITMQ_NAME = os.getenv('RABBITMQ_NAME')
RABBITMQ_USER = os.getenv('RABBITMQ_USER')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS')
RABBITMQ_URL = f"amqp://{RABBITMQ_USER}:{RABBITMQ_PASS}@{RABBITMQ_NAME}"
RABBITMQ_TOPIC_MESSAGE = os.getenv('RABBITMQ_TOPIC_MESSAGE')
RABBITMQ_TOPIC_LOG = os.getenv('RABBITMQ_TOPIC_LOG')
CONFIG = {"url": RABBITMQ_URL, "exchange": "messages"}


def create_connection(url):
    parameters = pika.URLParameters(url)
    return pika.BlockingConnection(parameters)


def setup_channel(connection, exchange, produceQueueName, consumeQueueName):
    channel = connection.channel()
    # bind the exhange to send msgs to "log" queue of the message broker
    channel.exchange_declare(
        exchange=exchange, exchange_type='direct', durable=True)
    channel.queue_declare(queue=produceQueueName, durable=False)
    channel.queue_bind(exchange=exchange, queue=produceQueueName,
                       routing_key=produceQueueName)

    channel.queue_declare(queue=consumeQueueName, durable=False)
    channel.queue_bind(exchange=exchange, queue=consumeQueueName,
                       routing_key=consumeQueueName)
    return channel


if __name__ == "__main__":
    # wait for 2 seconds, establish an HTTP server and RabbitMQ connection
    time.sleep(2)

    connection = create_connection(url=CONFIG['url'])
    channel = setup_channel(
        connection=connection,
        exchange=CONFIG['exchange'],
        produceQueueName=RABBITMQ_TOPIC_LOG,
        consumeQueueName=RABBITMQ_TOPIC_MESSAGE)

    # pass channel to HTTP server, since it needs to send msgs to the broker
    handler_partial = functools.partial(Handler,
                                        channel=channel,
                                        exchange=CONFIG['exchange'],
                                        produceQueueName=RABBITMQ_TOPIC_LOG,)
    webServer = HTTPServer((HOST_NAME, SERVER_PORT), handler_partial)
    print(f"HTTP server running on port {SERVER_PORT} 🔥")

    consumer = Consumer(consumeQueueName=RABBITMQ_TOPIC_MESSAGE,
                        produceQueueName=RABBITMQ_TOPIC_LOG,
                        config=CONFIG)
    thread = threading.Thread(target=consumer.setup, args=())
    thread.start()

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    print("Shutting down ✔️")
    webServer.server_close()
    connection.close()
    sys.exit(0)
