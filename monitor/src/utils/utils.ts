import amqp from "amqplib";
import { RABBITMQ_EXCHANGE, RABBITMQ_URL } from "../config/variables";

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Creates a TCP connection to send data to RabbitMQ.
 *  Queues are declared in case they do not exist yet. */
export const initializeAmqp = async ({
  queueNames,
}: {
  queueNames: string[];
}) => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    channel.assertExchange(RABBITMQ_EXCHANGE, "direct", { durable: true });

    for (let name of queueNames) {
      await channel.assertQueue(name, { durable: false });
      await channel.bindQueue(name, RABBITMQ_EXCHANGE, name);
    }
    return channel;
  } catch (err) {
    console.log(`Encountered an error during amqp initialization: ${err}`);
  }
};
