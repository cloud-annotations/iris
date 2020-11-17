import http from "http";

import { RedisClient } from "redis";
import { Server, Socket } from "socket.io";
import { createAdapter } from "socket.io-redis";

interface CustomSocket extends Socket {
  room?: string;
}

function multiuser(server: http.Server) {
  const io = new Server(server);

  const pubClient = new RedisClient({ host: "redis", port: 6379 });

  pubClient.on("ready", () => {
    console.log("pub client ready");
    const subClient = pubClient.duplicate();
    subClient.on("ready", () => {
      console.log("sub client ready");
      console.log("creating addapter");
      io.adapter(createAdapter({ pubClient, subClient }));
    });
    subClient.on("error", () => {
      // do nothing
    });
  });
  pubClient.on("error", () => {
    // do nothing
  });

  function broadcastRoomCount(room: string) {
    const namespace = io.in(room);
    const people = namespace.sockets.sockets.size;
    namespace.emit("roomSize", people);
  }

  io.on("connection", (socket: CustomSocket) => {
    socket.on("patch", (res: any) => {
      socket.broadcast.emit("patch", res);
    });

    socket.on("join", async (res: any) => {
      const newRoom = res.image;

      for (const room of socket.rooms) {
        socket.leave(room);
        broadcastRoomCount(room);
      }

      socket.room = newRoom;
      socket.join(newRoom);
      broadcastRoomCount(newRoom);
    });

    socket.on("disconnect", () => {
      if (socket.room) {
        broadcastRoomCount(socket.room);
      }
    });
  });
}

export default multiuser;
