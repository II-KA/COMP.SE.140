import amqp, { type Channel } from 'amqplib';
import axios from 'axios';
import { delay, sendMessage } from './utils/utils';
import {
  RABBITMQ_TOPIC_LOG,
  RABBITMQ_TOPIC_MESSAGE,
  SERVICE2_URL
} from './config/variables';

type MessageLoopData = {
  counter?: number;
  address: string;
  channel: Channel;
};

/** Performs messaging actions 20 times in 2 seconds intervals */
export const messageLoop = async ({
  address,
  channel,
  counter = 1
}: MessageLoopData) => {
  if (counter > 20) {
    console.log('Completed 20 rounds ✨');
    sendMessage({ channel, routingKey: RABBITMQ_TOPIC_LOG, msg: 'SND STOP\n' });
    return;
  }
  sendMessages({ counter, address, channel });
  await delay(2000);
  await messageLoop({ address, channel, counter: counter + 1 });
};

/** Composes a text from the counter, current time, and address+port of
 *  service2. The text is sent to service2 through message broker queue
 *  and HTTP protocol */
const sendMessages = async ({
  counter,
  address,
  channel
}: Required<MessageLoopData>) => {
  const text = `SND ${counter} ${new Date().toISOString()} ${address}`;
  console.log(text);

  sendMessage({ channel, routingKey: RABBITMQ_TOPIC_MESSAGE, msg: text });
  await sendMessageWithHTTP({ channel, text });
};

/** Sends a text to service2 with HTTP protocol and logs the response
 *  code and a timestamp to message broker queue. In case of an error,
 *  the error message is sent to message broker queue.
 */
const sendMessageWithHTTP = async ({
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
