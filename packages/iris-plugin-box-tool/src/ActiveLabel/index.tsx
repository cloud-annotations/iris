import React, { useCallback } from "react";

import { useDispatch } from "react-redux";

import { LabelSelect } from "@iris/components";
import { SELECT_LABEL, NEW_LABEL, useActiveLabel, useLabels } from "@iris/core";

function ActiveLabel() {
  const dispatch = useDispatch();

  const labels = useLabels();
  const activeLabel = useActiveLabel();

  const handleLabelChosen = useCallback(
    (label) => {
      dispatch(SELECT_LABEL(label));
    },
    [dispatch]
  );

  const handleNewLabel = useCallback(
    (label) => {
      const labelAction = NEW_LABEL(label);
      dispatch(labelAction);
      dispatch(SELECT_LABEL(labelAction.payload.id));
    },
    [dispatch]
  );

  return (
    <LabelSelect
      labels={labels}
      activeLabel={activeLabel}
      placeholder="Create new label"
      onChange={handleLabelChosen}
      onNew={handleNewLabel}
    />
  );
}

export default ActiveLabel;
