import http from "http";

import express from "express";

import errorHandler from "./handlers/error";
import notFoundHandler from "./handlers/not-found";
import gzip from "./middleware/gzip";
import logger from "./middleware/logger";
import security from "./middleware/security";
import multiuser from "./multiuser";
import spaRouter from "./routes/spa";
import v2Router from "./routes/v2";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 9000;

app.enable("trust proxy");
app.disable("x-powered-by");

multiuser(server);

app.use(gzip());
app.use(security());
app.use(logger());
app.use(express.json());

app.use("/api/v2", v2Router);
app.use("/", spaRouter);

app.use(notFoundHandler);
app.use(errorHandler);

server.listen(port, () => {
  console.log("listening on port " + port);
});
