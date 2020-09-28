import { Router } from "express";

const router = Router();

router.get("/files", (_req, res) => {
  res.send("hello try16!");
});

export default router;
