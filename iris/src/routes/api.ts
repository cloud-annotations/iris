import Busboy from "busboy";
import { Router } from "express";

import ProjectProvider from "./../plugins/ProjectProvider";

const router = Router();

const provider = new ProjectProvider();

const SINGLE_DOCUMENT_MODE = true;

router.get("/mode", async (_req, res) => {
  res.json({ singleDocument: SINGLE_DOCUMENT_MODE });
});

router.get("/projects", async (_req, res) => {
  if (!SINGLE_DOCUMENT_MODE) {
    const projects = await provider.getProjects();
    res.json(projects);
  }
  res.end();
});

router.get("/projects/:projectID", async (req, res) => {
  let projectID;
  if (!SINGLE_DOCUMENT_MODE) {
    projectID = req.params.projectID;
  }
  const project = await provider.getProject(projectID);
  res.json(project);
});

router.post("/projects/:projectID", async (req, res) => {
  let projectID;
  if (!SINGLE_DOCUMENT_MODE) {
    projectID = req.params.projectID;
  }
  provider.persist(projectID, req.body);
  res.end();
});

router.get("/projects/:projectID/images/:imageID", async (req, res) => {
  const { imageID } = req.params;

  let projectID;
  if (!SINGLE_DOCUMENT_MODE) {
    projectID = req.params.projectID;
  }

  try {
    const s = await provider.getImage(projectID, imageID);
    s.on("open", () => {
      res.set("Content-Type", "image/jpeg");
      s.pipe(res);
    });
    s.on("error", (e) => {
      console.log(e);
      res.sendStatus(404);
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(404);
  }
});

router.post("/projects/:projectID/images", async (req, res) => {
  const busboy = new Busboy({
    headers: req.headers,
  });

  busboy.on("file", (fieldname, file) => {
    console.log(`Uploading ${fieldname}...`);
    provider.saveImage(fieldname, file).then(() => {
      res.end();
    });
  });

  req.pipe(busboy);
});

export default router;
