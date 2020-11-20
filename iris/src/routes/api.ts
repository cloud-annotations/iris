import Busboy from "busboy";
import { Request, Router } from "express";

import ProjectProvider from "../plugins/ProjectProvider";

const router = Router();

const provider = new ProjectProvider();

function getProjectID(req: Request) {
  const { projectID } = req.query;
  if (process.env.SINGLE_DOCUMENT_MODE && projectID === undefined) {
    return projectID;
  }
  if (!process.env.SINGLE_DOCUMENT_MODE && typeof projectID === "string") {
    return projectID;
  }
  throw new Error(
    `projectID "${projectID}" of type "${typeof projectID}" is not allowed in ${
      process.env.SINGLE_DOCUMENT_MODE
        ? "single document mode"
        : "projects mode"
    }`
  );
}

function ensureProjectMode() {
  if (process.env.SINGLE_DOCUMENT_MODE) {
    throw new Error("Projects not available in single document mode");
  }
}

/**
 * GET /api/mode
 */
router.get("/mode", async (_req, res) => {
  res.json({ singleDocument: process.env.SINGLE_DOCUMENT_MODE });
});

/**
 * GET /api/projects
 */
router.get("/projects", async (_req, res, next) => {
  try {
    ensureProjectMode();
    const projects = await provider.getProjects();
    res.json(projects);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/project
 * @queryParam {string} [projectID]
 */
router.get("/project", async (req, res, next) => {
  try {
    const projectID = getProjectID(req);
    const project = await provider.getProject({ projectID });
    res.json(project);
  } catch (e) {
    next(e);
  }
});

/**
 * PUT /api/project
 * @queryParam {string} [projectID]
 */
router.put("/project", async (req, res, next) => {
  try {
    const projectID = getProjectID(req);
    await provider.persist(req.body, { projectID });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/images/:imageID
 * @pathParam {string} imageID
 * @queryParam {string} [projectID]
 */
router.get("/images/:imageID", async (req, res, next) => {
  const { imageID } = req.params;

  try {
    const projectID = getProjectID(req);
    const image = await provider.getImage(imageID, { projectID });

    image.on("error", (e) => {
      throw e;
    });

    res.set("Content-Type", "image/jpeg");
    image.pipe(res);
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/images/:imageID
 * @pathParam {string} imageID
 * @queryParam {string} [projectID]
 */
router.delete("/images/:imageID", async (req, res, next) => {
  const { imageID } = req.params;

  try {
    const projectID = getProjectID(req);
    await provider.deleteImage(imageID, { projectID });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/images
 * @queryParam {string} [projectID]
 */
router.post("/images", async (req, res, next) => {
  try {
    const projectID = getProjectID(req);
    const busboy = new Busboy({
      headers: req.headers,
      limits: {
        files: 1,
      },
    });

    busboy.on("file", async (name, file) => {
      await provider.saveImage(file, { name, projectID });
      res.sendStatus(200);
    });

    req.pipe(busboy);
  } catch (e) {
    next(e);
  }
});

export default router;
