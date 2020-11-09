import { promises as fs2 } from "fs";
import fs from "fs";
import path from "path";

let projects = [
  { id: "project1", name: "project1", created: new Date() },
  { id: "my-first-project", name: "My first Project", created: new Date() },
  { id: "num-3", name: "num 3", created: new Date() },
];

class ProjectProvider {
  async getProjects() {
    return projects;
  }

  async getProject(projectID: string) {
    const project = projects.find((p) => p.id === projectID) as any;
    const annotationsString = await fs2.readFile(
      path.join(
        process.cwd(),
        "sample-projects",
        projectID,
        "_annotations.json"
      ),
      "utf-8"
    );
    project.annotations = JSON.parse(annotationsString);

    const files = await fs2.readdir(
      path.join(process.cwd(), "sample-projects", projectID)
    );
    project.annotations.images = files.filter(
      (f) =>
        f.toLowerCase().endsWith(".jpg") || f.toLowerCase().endsWith(".jpeg")
    );
    return project;
  }

  async persist(projectID: string, annotations: any) {
    await fs2.writeFile(
      path.join(
        process.cwd(),
        "sample-projects",
        projectID,
        "_annotations.json"
      ),
      JSON.stringify(annotations),
      "utf-8"
    );
  }

  async getImage(projectID: string, imageID: string) {
    return fs.createReadStream(
      path.join(process.cwd(), "sample-projects", projectID, imageID)
    );
  }
}

export default ProjectProvider;
