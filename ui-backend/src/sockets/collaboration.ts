import http from "http";

import { Request, Response } from "express";
import WebSocket from "ws";

function collaboration(req: Request, _res: Response) {
  const { app } = req;
  const server = http.createServer(app);

  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      console.log("received: %s", message);
    });

    ws.send("something");
  });

  // NOTE: this is kinda silly and will only let us call app.listen for one
  // port, but it's not like I would call it multiple times anyway...
  app.listen = (...args: any[]) => {
    return (server.listen.apply as any)(server, args);
  };
}

export default collaboration;
