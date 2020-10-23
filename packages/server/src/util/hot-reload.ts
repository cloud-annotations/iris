import { Server } from "http";
import { Socket } from "net";

function hotReload(module: any, server: Server) {
  if (module.hot) {
    let sockets: Socket[] = [];

    server.on("connection", (socket) => {
      sockets.push(socket);

      socket.once("close", () => {
        sockets.splice(sockets.indexOf(socket), 1);
      });
    });

    module.hot.accept();
    module.hot.dispose(() => {
      server.close();
      sockets.forEach((socket) => {
        socket.destroy();
      });
      sockets = [];
    });
  }
}

export default hotReload;
