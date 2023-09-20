import fs from "fs/promises";

const LOG_PATH = "../logs/service1.log";

export const appendLog = async (content: string) => {
  try {
    await fs.appendFile(LOG_PATH, content);
  } catch (err) {
    console.log(err);
  }
};

export const initLog = async () => {
  try {
    await fs.writeFile(LOG_PATH, "");
  } catch (err) {
    console.log(err);
  }
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
