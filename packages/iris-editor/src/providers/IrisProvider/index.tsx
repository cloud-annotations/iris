import React, { FC, useEffect } from "react";

import { Provider } from "react-redux";

import { store, load } from "@iris/core";

interface Props {
  projectID: string;
}

export const IrisProvider: FC<Props> = ({ projectID, children }) => {
  useEffect(() => {
    store.dispatch(load(projectID));
  }, [projectID]);

  return <Provider store={store}>{children}</Provider>;
};
