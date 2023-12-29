import express, { Express } from 'express';
import { Server } from 'http';
import {
  delay,
  getAddress,
  initializeAmqp,
  isValueInStateEnum,
  sendMessage,
  sendMessageWithHTTP
} from './utils/utils';
import {
  RABBITMQ_TOPIC_LOG,
  RABBITMQ_TOPIC_MESSAGE,
  RABBITMQ_TOPIC_STATE_SERVICE1,
  SERVICE1_PORT,
  SERVICE2_NAME,
  SERVICE2_PORT,
  configureEnvVariables
} from './config/variables';
import { Channel } from 'amqplib';
import { State } from './types/state';

const app: Express = express();
let server: Server;
let channel: Channel | undefined;
let state = State.Paused;
let counter = 1;

const consumeMessages = ({
  channel,
  queueName
}: {
  channel: Channel;
  queueName: string;
}) =>
  channel.consume(
    queueName,
    async msg => {
      if (!msg) return;
      channel.ack(msg);

      const newState = msg.content.toString('utf8');
      if (!isValueInStateEnum()(newState)) return;
      await updateState(newState);
    },
    // set for the broker to expect an acknowledgement of delivered msgs
    // i.e. msgs are not dequeued until they are explicitly acknowledged
    { noAck: false }
  );

const updateState = async (newState: State) => {
  state = newState === State.Running ? State.Running : State.Paused;
  if (newState === State.Init) counter = 1;
  if (newState === State.Shutdown) await shutDownServer();
};

type MessageLoopData = {
  address: string;
  channel: Channel;
};

/** Performs messaging actions in 2 seconds intervals */
const messageLoop = async ({ address, channel }: MessageLoopData) => {
  if (state === State.Running) {
    await sendMessages({ address, channel });
    counter += 1;
  }
  await delay(2000);
  await messageLoop({ address, channel });
};

/** Composes a text from the counter, current time, and address+port of
 *  service2. The text is sent to service2 through message broker queue
 *  and HTTP protocol */
const sendMessages = async ({ address, channel }: MessageLoopData) => {
  const text = `SND ${counter} ${new Date().toISOString()} ${address}`;
  console.log(text);

  sendMessage({ channel, routingKey: RABBITMQ_TOPIC_MESSAGE, msg: text });
  await sendMessageWithHTTP({ channel, text });
};

const startServer = async () =>
  (server = app.listen(SERVICE1_PORT, async () => {
    console.log(`HTTP server running on port ${SERVICE1_PORT} 🔥`);

    channel = await initializeAmqp({
      queueNames: [
        RABBITMQ_TOPIC_MESSAGE,
        RABBITMQ_TOPIC_LOG,
        RABBITMQ_TOPIC_STATE_SERVICE1
      ]
    });
    if (!channel) return;
    consumeMessages({ channel, queueName: RABBITMQ_TOPIC_STATE_SERVICE1 });
    console.log(`Consuming ${RABBITMQ_TOPIC_STATE_SERVICE1} messages 🥕`);
    const address = await getAddress({ serviceName: SERVICE2_NAME });
    if (!address) return;

    await messageLoop({ address: `${address}:${SERVICE2_PORT}`, channel });
  }));

const shutDownServer = async () => {
  console.log('Shutting down ✔️');
  await channel?.close();
  server.close();
  process.exit(0);
};

void configureEnvVariables();
void startServer();

process.on('SIGTERM', shutDownServer);
process.on('SIGINT', shutDownServer);
