import { Router } from "express";

const router = Router();

router.get("/status", (_req, res) => {
  res.send("you good!");
});

export default router;
