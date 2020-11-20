import path from "path";

import fs from "fs-extra";
import lockfile from "proper-lockfile";

interface IImage {
  id: string;
  date: string;
}

interface IProject {
  id?: string;
  name: string;
  created: Date;
  annotations: {
    version: string;
    labels: string[];
    annotations: {}; // TODO
    images: IImage[];
  };
}

interface IOptions {
  name: string;
  projectID?: string;
}

class ProjectProvider {
  private _dir(projectID: string | undefined) {
    if (projectID) {
      return path.join(process.cwd(), projectID);
    }
    return process.cwd();
  }

  async getProjects() {
    const x = await fs.readdir(process.cwd(), { withFileTypes: true });
    return x
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => ({
        id: dirent.name,
        name: dirent.name,
        created: new Date(),
      }));
  }

  async getProject(options: Pick<IOptions, "projectID">) {
    const { projectID } = options;

    const project: IProject = {
      id: projectID,
      name: projectID ?? path.basename(process.cwd()),
      created: new Date(),
      annotations: {
        version: "v2",
        labels: [],
        annotations: {},
        images: [],
      },
    };

    try {
      const annotationsString = await fs.readFile(
        path.join(this._dir(projectID), "_annotations.json"),
        "utf-8"
      );
      project.annotations = JSON.parse(annotationsString);
    } catch {
      // we don't care if there's no annotations file.
    }

    const files = await fs.readdir(this._dir(projectID));

    project.annotations.images = files
      .filter(
        (f) =>
          f.toLowerCase().endsWith(".jpg") || f.toLowerCase().endsWith(".jpeg")
      )
      .map((i) => ({ id: i, date: "" }));

    return project;
  }

  async persist(annotations: any, options: Pick<IOptions, "projectID">) {
    const { projectID } = options;

    const output = path.join(this._dir(projectID), "_annotations.json");

    // TODO: This probably isn't safe:
    // "It is unsafe to call fsPromises.writeFile() multiple times on the same
    // file without waiting for the Promise to be resolved (or rejected)."
    await fs.writeFile(output, JSON.stringify(annotations), "utf-8");
  }

  async getImage(imageID: string, options: Pick<IOptions, "projectID">) {
    const { projectID } = options;

    const output = path.join(this._dir(projectID), imageID);

    const isLocked = await lockfile.check(output);
    if (!isLocked) {
      return fs.createReadStream(output);
    }

    throw new Error("file is locked");
  }

  async deleteImage(imageID: string, options: Pick<IOptions, "projectID">) {
    const { projectID } = options;
    const output = path.join(this._dir(projectID), imageID);
    await fs.unlink(output);
  }

  async saveImage(file: NodeJS.ReadableStream, options: IOptions) {
    const { projectID, name } = options;
    const output = path.join(this._dir(projectID), name);

    await fs.ensureFile(output);
    const release = await lockfile.lock(output);
    const writeStream = fs.createWriteStream(output);
    file.pipe(writeStream);
    return new Promise((resolve, reject) => {
      writeStream.on("error", async (e) => {
        await release();
        reject(e);
      });
      writeStream.on("finish", async () => {
        await release();
        resolve();
      });
    });
  }
}

export default ProjectProvider;
