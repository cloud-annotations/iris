import { Router } from "express";

const router = Router();

router.get("/files", (_req, res) => {
  res.end();
});

export default router;
