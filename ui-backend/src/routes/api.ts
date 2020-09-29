import { Router } from "express";

import ProjectProvider from "src/plugins/ProjectProvider";

const router = Router();

const provider = new ProjectProvider();

router.get("/projects", async (_req, res) => {
  const projects = await provider.getProjects();
  res.json(projects);
});

router.get("/projects/:id", async (req, res) => {
  const project = await provider.getProject(req.params.id);
  res.json(project);
});

export default router;
