from http.server import BaseHTTPRequestHandler
import json


class Handler(BaseHTTPRequestHandler):
    def __init__(
        self, *args, channel=None, exchange=None, produce_queue_name=None, **kwargs
    ):
        self.channel = channel
        self.exchange = exchange
        self.produce_queue_name = produce_queue_name
        super().__init__(*args, **kwargs)

    def do_POST(self):
        length = int(self.headers.get("content-length"))
        data = json.loads(self.rfile.read(length))
        if data.get("log"):
            log = data["log"]
            [address, port] = self.client_address
            # write a log composed of the request log and remote address
            new_log = f"{log} {address}:{port}\n"
            print(f"HTTP: {new_log}", end="")
            # send the text to message broker topic "log"
            self.channel.basic_publish(
                exchange=self.exchange,
                routing_key=self.produce_queue_name,
                body=new_log,
            )
            self.respond(200, "text/plain", "ok")

    def respond(self, status, content_type, content):
        self.send_response(status)
        self.send_header("Content-type", content_type)
        self.end_headers()
        self.wfile.write(bytes(content, "UTF-8"))

    def log_message(self, format, *args):
        pass
