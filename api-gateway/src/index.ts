import express, { Express } from 'express';
import axios from 'axios';
import { type Channel } from 'amqplib';
import {
  API_GATEWAY_PORT,
  MONITOR_URL,
  configureEnvVariables,
  RABBITMQ_TOPIC_STATE_MONITOR,
  RABBITMQ_TOPIC_STATE_SERVICE2,
  RABBITMQ_TOPIC_STATE_SERVICE1
} from './config/variables';
import { initializeAmqp, isValueInStateEnum, sendMessage } from './utils/utils';
import { State } from './types/state';

const app: Express = express();
let channel: Channel | undefined;
// State and state-history is kept in memory
let state: State = State.Init;
const runLog: string[] = [];

app.use(express.text());

app.get('/messages', async (req, res) => {
  try {
    const messagesLog = (await axios.get(MONITOR_URL)).data;
    res.setHeader('Content-Type', 'text/plain').status(200).send(messagesLog);
  } catch (err) {
    res.status(404).send();
  }
});

app.get('/run-log', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain').status(200).send(runLog.join(''));
});

app.get('/state', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain').status(200).send(state);
});

app.put('/state', async (req, res) => {
  const newState = req.body;
  if (!isValueInStateEnum()(newState)) {
    res.sendStatus(400).send();
    return;
  }
  // If the new state is equal to previous, nothing happens
  if (state === newState) {
    res.setHeader('Content-Type', 'text/plain').status(200).send(state);
    return;
  }
  await updateState(newState);
  res.setHeader('Content-Type', 'text/plain').status(200).send(state);
});

const appendToLog = (newState: State) =>
  runLog.push(`${new Date().toISOString()}: ${state}->${newState}\n`);

const updateState = async (newState: State) => {
  appendToLog(newState);
  sendState(newState, RABBITMQ_TOPIC_STATE_SERVICE1);
  if (newState === State.Shutdown) {
    sendState(newState, RABBITMQ_TOPIC_STATE_SERVICE2);
    sendState(newState, RABBITMQ_TOPIC_STATE_MONITOR);
  }
  state = newState;
  if (newState === State.Init) await updateState(State.Running);
  if (newState === State.Shutdown) await shutDownServer();
};

const sendState = async (newState: State, routingKey: string) =>
  sendMessage({ channel, routingKey, msg: newState });

/** Resets the state & state-history, used for testing. */
app.post('/reset', async (req, res) => {
  runLog.splice(0, runLog.length);
  await updateState(State.Init);
  res.status(200).send();
});

void configureEnvVariables();

const server = app.listen(API_GATEWAY_PORT, async () => {
  console.log(`HTTP server running on port ${API_GATEWAY_PORT} 🔥`);

  channel = await initializeAmqp({
    queueNames: [
      RABBITMQ_TOPIC_STATE_MONITOR,
      RABBITMQ_TOPIC_STATE_SERVICE1,
      RABBITMQ_TOPIC_STATE_SERVICE2
    ]
  });
  if (!channel) return;
  await updateState(State.Running);
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
