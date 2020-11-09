import React, { useCallback } from "react";

import { useSelector, useDispatch } from "react-redux";

import { LabelSelect } from "@iris/components";

function ActiveLabel() {
  const dispatch = useDispatch();
  const labels = useSelector((state: any) => state.project.categories);
  const activeLabel = useSelector(
    (state: any) => state.project.ui.selectedCategory
  );

  const handleLabelChosen = useCallback(
    (label) => {
      dispatch({
        type: "project/selectCategory",
        payload: label,
      });
    },
    [dispatch]
  );

  return (
    <LabelSelect
      labels={labels}
      activeLabel={activeLabel}
      onChange={handleLabelChosen}
    />
  );
}

export default ActiveLabel;
