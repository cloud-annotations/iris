import { Server } from "http";

import WebSocket from "ws";

function collaboration(server: Server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      console.log("received: %s", message);
    });

    ws.send("something");
  });
}

export default collaboration;
