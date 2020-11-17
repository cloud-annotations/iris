import http from "http";

import { Server, Socket } from "socket.io";

interface CustomSocket extends Socket {
  room?: string;
}

function multiuser(server: http.Server) {
  const io = new Server(server);

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
