import pika


class Consumer:
    def __init__(self, consumeQueueName, produceQueueName, config):
        self.consumeQueueName = consumeQueueName
        self.produceQueueName = produceQueueName
        self.config = config
        self.connection = self._create_connection()

    def __del__(self):
        self.connection.close()

    def _create_connection(self):
        parameters = pika.URLParameters(self.config["url"])
        return pika.BlockingConnection(parameters)

    def on_message_callback(self, channel, method, properties, body):
        newText = body.decode("utf-8") + " MSG\n"
        print(f"RABBITMQ: {newText}", end="")
        # send the new text to message broker topic "log"
        channel.basic_publish(
            exchange=self.config["exchange"],
            routing_key=self.produceQueueName,
            body=newText,
        )

    def setup(self):
        channel = self.connection.channel()
        # bind the exhange to send msgs to "log" queue of the message broker
        channel.exchange_declare(
            exchange=self.config["exchange"], exchange_type="direct", durable=True
        )
        channel.queue_declare(queue=self.produceQueueName, durable=False)
        channel.queue_bind(
            exchange=self.config["exchange"],
            queue=self.produceQueueName,
            routing_key=self.produceQueueName,
        )

        channel.queue_declare(queue=self.consumeQueueName, durable=False)
        channel.queue_bind(
            exchange=self.config["exchange"],
            queue=self.consumeQueueName,
            routing_key=self.consumeQueueName,
        )
        # Consume messages from the "message" queue of the message broker
        channel.basic_consume(
            queue=self.consumeQueueName,
            on_message_callback=self.on_message_callback,
            auto_ack=True,
        )
        print(f"Consuming '{self.consumeQueueName}' messages 🥕")
        try:
            channel.start_consuming()
        except KeyboardInterrupt:
            print("Stopping consuming messages ✔️")
            channel.stop_consuming()
