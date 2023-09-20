import express, { Express } from "express";
import axios from "axios";
import dns from "dns";
import dotenv from "dotenv";
import { Server } from "http";
import { appendLog, delay, initLog } from "./utils";

dotenv.config();

const PORT = process.env.SERVICE1_PORT;
const SERVICE2_PORT = process.env.SERVICE2_PORT;
const SERVICE2_NAME = process.env.SERVICE2_NAME;
const BASE_URL = `http://${SERVICE2_NAME}:${SERVICE2_PORT}`;

const app: Express = express();
let server: Server;

const loop = async (address: string, counter = 1) => {
  if (counter > 20) return;
  composeLog(counter, address);
  await delay(2000);
  await loop(address, counter + 1);
};

const composeLog = async (counter: number, address: string) => {
  // compose the log from a counter, current time, address+port of service2
  const content = `${counter} ${new Date().toISOString()} ${address}`;
  console.log(content);
  await appendLog(`${content}\n`);
  try {
    await axios.post(BASE_URL, { log: content });
  } catch (error) {
    console.log(error);
    appendLog(`${error}\n`);
  }
};

const startServer = async () =>
  (server = app.listen(PORT, async () => {
    console.log(`Running on port ${PORT} 🔥`);
    try {
      // look up the address of service2 (the port is from .env)
      const { address } = await dns.promises.lookup(SERVICE2_NAME || "");
      await loop(`${address}:${SERVICE2_PORT}`);
    } catch (err) {
      console.log(err);
    }
    await shutDownServer();
  }));

const shutDownServer = async () => {
  await appendLog("STOP");
  try {
    await axios.post(BASE_URL, { command: "STOP" });
  } catch (error) {
    console.log(error);
  }
  console.log("Shutting down ✔️");
  server.close();
  process.exit(0);
};

void initLog();
void startServer();

process.on("SIGTERM", shutDownServer);
process.on("SIGINT", shutDownServer);
