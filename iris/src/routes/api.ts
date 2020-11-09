import { Router } from "express";

import ProjectProvider from "src/plugins/ProjectProvider";

const router = Router();

const provider = new ProjectProvider();

router.get("/projects", async (_req, res) => {
  const projects = await provider.getProjects();
  res.json(projects);
});

router.get("/projects/:projectID", async (req, res) => {
  const project = await provider.getProject(req.params.projectID);
  res.json(project);
});

router.post("/projects/:projectID", async (req, res) => {
  provider.persist(req.params.projectID, req.body);
  res.end();
});

router.get("/projects/:projectID/images/:imageID", async (req, res) => {
  const { projectID, imageID } = req.params;
  const s = await provider.getImage(projectID, imageID);
  s.on("open", () => {
    res.set("Content-Type", "image/jpeg");
    s.pipe(res);
  });
  s.on("error", (e) => {
    console.log(e);
    res.set("Content-Type", "text/plain");
    res.status(404).end("Not found");
  });
});

export default router;
