import express, { Express } from 'express';
import { type Channel } from 'amqplib';
import {
  MONITOR_PORT,
  RABBITMQ_TOPIC_LOG,
  configureEnvVariables
} from './config/variables';
import { initializeAmqp } from './utils/utils';

const app: Express = express();
let channel: Channel | undefined;
// Received messages are kept in the memory
const logs: string[] = [];

const consumeMessages = ({
  channel,
  queueName
}: {
  channel: Channel;
  queueName: string;
}) =>
  channel.consume(
    queueName,
    msg => {
      if (!msg) return;

      const log = msg.content.toString('utf8');
      process.stdout.write(`RECEIVED: ${log}`);
      logs.push(log);

      channel.ack(msg);
    },
    // set for the broker to expect an acknowledgement of delivered msgs
    // i.e. msgs are not dequeued until they are explicitly acknowledged
    { noAck: false }
  );

/** Listens to GET requests. As a response, returns the received strings
 *  from the message broker as "text/plain" with each msgs on a separate
 *  line. */
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  // each log should already end with a new line, so just
  // concatenate the array of logs
  res.send(logs.join(''));
});

/** Resets the logs array. Mainly used for testing. */
app.post('/reset', (req, res) => {
  logs.splice(0, logs.length);
  console.log('Resetting logs');
  res.status(200).send();
});

void configureEnvVariables();

const server = app.listen(MONITOR_PORT, async () => {
  console.log(`HTTP server running on port ${MONITOR_PORT} 🔥`);

  channel = await initializeAmqp({
    queueNames: [RABBITMQ_TOPIC_LOG]
  });
  if (!channel) return;

  consumeMessages({ channel, queueName: RABBITMQ_TOPIC_LOG });
  console.log(`Consuming ${RABBITMQ_TOPIC_LOG} messages 🥕`);
});

const shutDownServer = async () => {
  console.log('Shutting down ✔️');
  await channel?.close();
  server.close();
  process.exit(0);
};

process.on('SIGTERM', shutDownServer);
process.on('SIGINT', shutDownServer);

export { server, shutDownServer };
