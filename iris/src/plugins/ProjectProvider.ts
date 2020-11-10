import { promises as fs2 } from "fs";
import fs from "fs";
import path from "path";

class ProjectProvider {
  async getProjects() {
    return [];
  }

  async getProject(projectID: string | undefined) {
    const project = {
      id: path.basename(process.cwd()),
      name: path.basename(process.cwd()),
      created: new Date(),
      annotations: {
        version: "v2",
        labels: [],
        annotations: {},
        images: [],
      },
    } as any;

    try {
      const annotationsString = await fs2.readFile(
        path.join(process.cwd(), "_annotations.json"),
        "utf-8"
      );
      project.annotations = JSON.parse(annotationsString);
    } catch {}

    let files;
    if (projectID) {
      files = await fs2.readdir(path.join(process.cwd(), projectID));
    } else {
      files = await fs2.readdir(path.join(process.cwd()));
    }

    project.annotations.images = files.filter(
      (f) =>
        f.toLowerCase().endsWith(".jpg") || f.toLowerCase().endsWith(".jpeg")
    );

    return project;
  }

  async persist(projectID: string | undefined, annotations: any) {
    let output;
    if (projectID) {
      output = path.join(process.cwd(), projectID, "_annotations.json");
    } else {
      output = path.join(process.cwd(), "_annotations.json");
    }

    await fs2.writeFile(output, JSON.stringify(annotations), "utf-8");
  }

  async getImage(projectID: string | undefined, imageID: string) {
    if (projectID) {
      return fs.createReadStream(path.join(process.cwd(), projectID, imageID));
    } else {
      return fs.createReadStream(path.join(process.cwd(), imageID));
    }
  }
}

export default ProjectProvider;
