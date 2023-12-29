from http.server import HTTPServer
import functools
import sys
import threading
import os
import time
from request_handler import Handler
from consumer import Consumer
from dotenv import load_dotenv
import pika

load_dotenv()

HOST_NAME = "0.0.0.0"
SERVER_PORT = int(os.getenv("SERVICE2_PORT"))
RABBITMQ_NAME = os.getenv("RABBITMQ_NAME")
RABBITMQ_USER = os.getenv("RABBITMQ_USER")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS")
RABBITMQ_URL = f"amqp://{RABBITMQ_USER}:{RABBITMQ_PASS}@{RABBITMQ_NAME}"
RABBITMQ_TOPIC_MESSAGE = os.getenv("RABBITMQ_TOPIC_MESSAGE")
RABBITMQ_TOPIC_STATE_SERVICE2 = os.getenv("RABBITMQ_TOPIC_STATE_SERVICE2")
RABBITMQ_TOPIC_LOG = os.getenv("RABBITMQ_TOPIC_LOG")
CONFIG = {"url": RABBITMQ_URL, "exchange": "messages"}


def create_connection(url):
    parameters = pika.URLParameters(url)
    return pika.BlockingConnection(parameters)


def setup_channel(
    connection, exchange, produce_queue_name, consume_msg_queue, consume_state_queue
):
    channel = connection.channel()
    # bind the exhange to send msgs to "log" queue of the message broker
    channel.exchange_declare(exchange=exchange, exchange_type="direct", durable=True)
    channel.queue_declare(queue=produce_queue_name, durable=False)
    channel.queue_bind(
        exchange=exchange, queue=produce_queue_name, routing_key=produce_queue_name
    )

    channel.queue_declare(queue=consume_msg_queue, durable=False)
    channel.queue_bind(
        exchange=exchange, queue=consume_msg_queue, routing_key=consume_msg_queue
    )

    channel.queue_declare(queue=consume_state_queue, durable=False)
    channel.queue_bind(
        exchange=exchange, queue=consume_state_queue, routing_key=consume_state_queue
    )
    return channel


if __name__ == "__main__":
    # wait for 2 seconds, establish an HTTP server and RabbitMQ connection
    time.sleep(2)

    connection = create_connection(url=CONFIG["url"])
    channel = setup_channel(
        connection=connection,
        exchange=CONFIG["exchange"],
        produce_queue_name=RABBITMQ_TOPIC_LOG,
        consume_msg_queue=RABBITMQ_TOPIC_MESSAGE,
        consume_state_queue=RABBITMQ_TOPIC_STATE_SERVICE2,
    )

    # pass channel to HTTP server, since it needs to send msgs to the broker
    handler_partial = functools.partial(
        Handler,
        channel=channel,
        exchange=CONFIG["exchange"],
        produce_queue_name=RABBITMQ_TOPIC_LOG,
    )
    webServer = HTTPServer((HOST_NAME, SERVER_PORT), handler_partial)
    print(f"HTTP server running on port {SERVER_PORT} 🔥")

    consumer = Consumer(
        consume_msg_queue=RABBITMQ_TOPIC_MESSAGE,
        consume_state_queue=RABBITMQ_TOPIC_STATE_SERVICE2,
        produce_queue=RABBITMQ_TOPIC_LOG,
        config=CONFIG,
    )
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
