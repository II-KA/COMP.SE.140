from http.server import BaseHTTPRequestHandler, HTTPServer
from dotenv import load_dotenv
import functools
import threading
import os
import json
import time

load_dotenv()

HOST_NAME = "0.0.0.0"
SERVER_PORT = int(os.getenv('SERVICE2_PORT'))

class Handler(BaseHTTPRequestHandler):
  def __init__(self, *args, file=None, **kwargs):
    self.file = file
    super().__init__(*args, **kwargs)

  def do_POST(self):
    length = int(self.headers.get("content-length"))
    data = json.loads(self.rfile.read(length))
    if data.get("command") == "STOP":
      self.respond(200, "text/plain", "ok")
      # shutdown cannot be called from the thread that runs the
      # server loop, so doing so in another thread instead
      t = threading.Thread(target = self.server.shutdown, daemon=True)
      t.start()
    elif data.get("log"):
      log = data["log"]
      [address, port] = self.client_address
       # write a log composed of the request log + remote address
      newLog = f"{log} {address}:{port}\n"
      print(f"{newLog}", end="")
      self.file.write(newLog)
      self.respond(200, "text/plain", "ok")
      
  def respond(self, status, content_type, content):
    self.send_response(status)
    self.send_header("Content-type", content_type)
    self.end_headers()
    self.wfile.write(bytes(content, "UTF-8"))

  def shut_down(self):
    self._server.shutdown()


if __name__ == "__main__":
  # service2.log if it does not exists, overwrite existing file
  file = open("../logs/service2.log", "w")
  time.sleep(2)

  # pass extra data to the class from https://stackoverflow.com/a/67610960
  handler_partial = functools.partial(Handler, file=file)     
  webServer = HTTPServer((HOST_NAME, SERVER_PORT), handler_partial)
  print(f"Running on port {SERVER_PORT} 🔥")

  try:
    webServer.serve_forever()
  except KeyboardInterrupt:
    pass

  print("Shutting down ✔️")
  file.close()
  webServer.server_close()