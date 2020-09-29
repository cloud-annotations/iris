let projects = [
  { id: "project1", name: "project1", created: new Date() },
  { id: "my-first-project", name: "My first Project", created: new Date() },
  { id: "num-3", name: "num 3", created: new Date() },
];

class ProjectProvider {
  async getProjects() {
    return projects;
  }

  async getProject(id: string) {
    return projects.find((project) => project.id === id);
  }
}

export default ProjectProvider;
