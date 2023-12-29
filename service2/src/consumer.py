import os
import pika


class Consumer:
    def __init__(self, consume_msg_queue, consume_state_queue, produce_queue, config):
        self.consume_msg_queue = consume_msg_queue
        self.consume_state_queue = consume_state_queue
        self.produce_queue = produce_queue
        self.config = config
        self.connection = self._create_connection()

    def __del__(self):
        self.connection.close()

    def _create_connection(self):
        parameters = pika.URLParameters(self.config["url"])
        return pika.BlockingConnection(parameters)

    def on_message_callback(self, channel, method, properties, body):
        new_text = body.decode("utf-8") + " MSG\n"
        print(f"RABBITMQ: {new_text}", end="")
        # send the new text to message broker topic "log"
        channel.basic_publish(
            exchange=self.config["exchange"],
            routing_key=self.produce_queue,
            body=new_text,
        )

    def on_state_callback(self, channel, method, properties, body):
        state = body.decode("utf-8")
        if state == "SHUTDOWN":
            print("Shutting down ✔️")
            channel.close()
            os._exit(1)

    def setup(self):
        channel = self.connection.channel()
        # bind the exhange to send msgs to "log" queue of the message broker
        channel.exchange_declare(
            exchange=self.config["exchange"], exchange_type="direct", durable=True
        )
        channel.queue_declare(queue=self.produce_queue, durable=False)
        channel.queue_bind(
            exchange=self.config["exchange"],
            queue=self.produce_queue,
            routing_key=self.produce_queue,
        )

        channel.queue_declare(queue=self.consume_msg_queue, durable=False)
        channel.queue_bind(
            exchange=self.config["exchange"],
            queue=self.consume_msg_queue,
            routing_key=self.consume_msg_queue,
        )
        # Consume messages from the "message" queue of the message broker
        channel.basic_consume(
            queue=self.consume_msg_queue,
            on_message_callback=self.on_message_callback,
            auto_ack=True,
        )

        channel.queue_declare(queue=self.consume_state_queue, durable=False)
        channel.queue_bind(
            exchange=self.config["exchange"],
            queue=self.consume_state_queue,
            routing_key=self.consume_state_queue,
        )
        # Consume messages from the "state" queue of the message broker
        channel.basic_consume(
            queue=self.consume_state_queue,
            on_message_callback=self.on_state_callback,
            auto_ack=True,
        )
        print("Consuming msgs 🥕")
        try:
            channel.start_consuming()
        except KeyboardInterrupt:
            print("Stopping consuming messages ✔️")
            channel.stop_consuming()
