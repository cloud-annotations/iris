interface IOptions {
  name: string;
  projectID?: string;
}

class COSProvider {
  async getConnections() {
    return Promise.resolve([
      {
        id: "c1nc874102374cn17d2374h",
        providerID: "cos",
        name: "bee-travels",
      },
      {
        id: "2e389r17921s2072nre1029",
        providerID: "cos",
        name: "Cloud Object Storage-nick",
      },
    ]);
  }

  async getProjects({ connectionID }: { connectionID: string }) {
    return Promise.resolve([{ id: connectionID, name: connectionID }]);
  }

  async getProject(options: Pick<IOptions, "projectID">) {}

  async persist(annotations: any, options: Pick<IOptions, "projectID">) {}

  async getImage(imageID: string, options: Pick<IOptions, "projectID">) {}

  async deleteImage(imageID: string, options: Pick<IOptions, "projectID">) {}

  async saveImage(file: NodeJS.ReadableStream, options: IOptions) {}
}

export default COSProvider;
