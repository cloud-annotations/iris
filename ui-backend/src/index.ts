import express from "express";

import gzip from "./middleware/gzip";
import logger from "./middleware/logger";
import security from "./middleware/security";
import apiRouter from "./routes/api";
import authRouter from "./routes/auth";
import spaRouter from "./routes/spa";
import collaboration from "./sockets/collaboration";

const app = express();
const port = process.env.PORT || 9000;

app.enable("trust proxy");
app.disable("x-powered-by");

app.use(gzip());
app.use(security());
app.use(logger());

app.use(collaboration);

app.use("/api", apiRouter);
app.use("/auth", authRouter);
app.use("/", spaRouter);

app.listen(port, () => {
  console.log("listening on port " + port);
});
