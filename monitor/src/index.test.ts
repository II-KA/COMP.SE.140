import { type Channel } from 'amqplib';
import request from 'supertest';
import { server as app, shutDownServer } from './index';
import { delay, initializeAmqp } from './utils/utils';
import { RABBITMQ_EXCHANGE, RABBITMQ_TOPIC_LOG } from './config/variables';

const sendMessage = ({
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

describe('Monitor', () => {
  let channel: Channel | undefined;

  beforeEach(async () => {
    await initializeAmqp({
      queueNames: [RABBITMQ_TOPIC_LOG]
    });
    await request(app).post('/reset');
  });

  afterAll(async () => {
    await channel?.close();
    await shutDownServer();
  });

  describe(`GET /`, () => {
    it('should return an empty string when no messages exist', async () => {
      await delay(1000);
      const res = await request(app)
        .get('/')
        .set({ 'Content-Type': 'text/plain', Accept: '*/*' })
        .expect(200);
      expect(res.text).toEqual('');
    });

    it('should return a log when the log message is produced', async () => {
      if (!channel) return;

      const text = `SND 1 ${new Date().toISOString()} testaddr`;
      sendMessage({ channel, routingKey: RABBITMQ_TOPIC_LOG, msg: text });

      await delay(1000);
      const res = await request(app)
        .get('/')
        .set({ 'Content-Type': 'text/plain', Accept: '*/*' })
        .expect(200);
      expect(res.text).toEqual(text);
    });

    it('should return a string of logs separated by newlines when multiple log messages are produced', async () => {
      if (!channel) return;

      const text1 = `SND 1 ${new Date().toISOString()} testaddr`;
      sendMessage({ channel, routingKey: RABBITMQ_TOPIC_LOG, msg: text1 });
      const text2 = `SND 2 ${new Date().toISOString()} testaddr`;
      sendMessage({ channel, routingKey: RABBITMQ_TOPIC_LOG, msg: text2 });

      await delay(1000);
      const res = await request(app)
        .get('/')
        .set({ 'Content-Type': 'text/plain', Accept: '*/*' })
        .expect(200);
      expect(res.text).toEqual(`${text1}\n${text2}`);
    });
  });
});
