import COSProvider from "./COSProvider";

export default {
  activate: (iris: any) => {
    iris.providers.register({
      id: "cos",
      provider: new COSProvider(),
    });
  },
};
