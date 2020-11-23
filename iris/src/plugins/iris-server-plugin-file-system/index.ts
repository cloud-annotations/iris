import FileSystemProvider from "./FileSystemProvider";

export default {
  activate: (iris: any) => {
    iris.providers.register({
      id: "file-system",
      provider: new FileSystemProvider(),
    });
  },
};
