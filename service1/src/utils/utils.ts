import amqp, { type Channel } from 'amqplib';
import dns from 'dns';
import axios from 'axios';
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_TOPIC_LOG,
  RABBITMQ_URL,
  SERVICE2_URL
} from '../config/variables';
import { State } from '../types/state';

export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Looks up the address of a service */
export const getAddress = async ({ serviceName }: { serviceName: string }) => {
  try {
    return (await dns.promises.lookup(serviceName)).address;
  } catch (error) {
    console.log(`Encountered an error during address lookup: ${error}`);
  }
};

/** Creates a TCP connection to send data to RabbitMQ.
 *  Queues are declared in case they do not exist yet. */
export const initializeAmqp = async ({
  queueNames
}: {
  queueNames: string[];
}) => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    channel.assertExchange(RABBITMQ_EXCHANGE, 'direct', { durable: true });

    for (const name of queueNames) {
      await channel.assertQueue(name, { durable: false });
      await channel.bindQueue(name, RABBITMQ_EXCHANGE, name);
    }
    return channel;
  } catch (err) {
    console.log(`Encountered an error during amqp initialization: ${err}`);
    console.log(err);
  }
};

/** Sends an message to a RabbitMQ topic. */
export const sendMessage = ({
  msg,
  channel,
  routingKey
}: {
  msg: string;
  channel: Channel;
  routingKey: string;
}) =>
  channel.publish(RABBITMQ_EXCHANGE, routingKey, Buffer.from(msg, 'utf-8'), {
    persistent: false
  });

/** Sends a text to service2 with HTTP protocol and logs the response
 *  code and a timestamp to message broker queue. In case of an error,
 *  the error message is sent to message broker queue.
 */
export const sendMessageWithHTTP = async ({
  channel,
  text
}: {
  channel: amqp.Channel;
  text: string;
}) => {
  try {
    const res = await axios.post(SERVICE2_URL, { log: text });

    sendMessage({
      channel,
      routingKey: RABBITMQ_TOPIC_LOG,
      msg: `${res.status} ${new Date().toISOString()}\n`
    });
  } catch (error) {
    if (axios.isAxiosError(error))
      sendMessage({
        channel,
        routingKey: RABBITMQ_TOPIC_LOG,
        msg: `${error.request ? error.message : error.message}\n`
      });
  }
};

export const isValueInStateEnum = () => {
  const enumValues = Object.values(State) as string[];
  return (value: string): value is State => enumValues.includes(value);
};
