import logging
import os
import random
import socket
import threading
import time


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

DEFAULT_PORTS = "21,2121,2323,5001,64000"
FTP_PORT = int(os.getenv("FAKE_FTP_PORT", "21"))
PORTS = {
    int(port.strip())
    for port in os.getenv("DECOY_PORTS", DEFAULT_PORTS).split(",")
    if port.strip()
}
PORTS.add(FTP_PORT)

FTP_BANNER = [
    "220 (FakeFTPd 0.0.1) ready\r\n",
    "331 Please specify the password.\r\n",
]

GENERIC_RESPONSES = [
    "Hello adventurer, nothing to see here.\n",
    "System busy, try again later.\n",
    "Unhandled command received.\n",
]


def handle_connection(conn: socket.socket, addr, port: int) -> None:
    """Send intentionally unhelpful responses to connections."""
    conn.settimeout(5)
    peer = f"{addr[0]}:{addr[1]}"
    logging.info("Connection from %s on port %s", peer, port)
    try:
        if port == FTP_PORT:
            for line in FTP_BANNER:
                conn.sendall(line.encode("ascii"))
            try:
                _ = conn.recv(1024)
                time.sleep(random.uniform(0.5, 2.5))
                conn.sendall(b"530 Login incorrect.\r\n")
            except (socket.timeout, ConnectionError):
                pass
        else:
            try:
                conn.sendall(random.choice(GENERIC_RESPONSES).encode("ascii"))
                _ = conn.recv(1024)
                time.sleep(random.uniform(0.5, 2.0))
                conn.sendall(b"Session closed.\n")
            except (socket.timeout, ConnectionError):
                pass
    finally:
        conn.close()
        logging.info("Connection from %s on port %s closed", peer, port)


def start_listener(port: int) -> None:
    """Listen on a single port and spawn handlers for incoming connections."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind(("0.0.0.0", port))
        sock.listen(5)
        logging.info("Decoy listener active on port %s", port)
        while True:
            conn, addr = sock.accept()
            threading.Thread(
                target=handle_connection, args=(conn, addr, port), daemon=True
            ).start()


def main() -> None:
    listeners = []
    for port in PORTS:
        thread = threading.Thread(target=start_listener, args=(port,), daemon=True)
        listeners.append(thread)
        thread.start()

    # Keep the main thread alive so the container stays up.
    while True:
        time.sleep(60)


if __name__ == "__main__":
    main()
