import http from "http";

import express from "express";

import errorHandler from "./handlers/error";
import notFoundHandler from "./handlers/not-found";
import gzip from "./middleware/gzip";
import logger from "./middleware/logger";
import security from "./middleware/security";
import apiRouter from "./routes/api";
import authRouter from "./routes/auth";
import spaRouter from "./routes/spa";
import hotReload from "./util/hot-reload";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 9000;

app.enable("trust proxy");
app.disable("x-powered-by");

app.use(gzip());
app.use(security());
app.use(logger());

app.use("/api", apiRouter);
app.use("/auth", authRouter);
app.use("/", spaRouter);

app.use(notFoundHandler);
app.use(errorHandler);

server.listen(port, () => {
  console.log("listening on port " + port);
});

hotReload(module, server);
