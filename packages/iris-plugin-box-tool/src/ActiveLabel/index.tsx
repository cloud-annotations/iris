import React from "react";

import { Select } from "@iris/components";
import { useSelector, useDispatch } from "react-redux";

function ActiveLabel() {
  const dispatch = useDispatch();
  const labels = useSelector((state: any) => state.project.categories);
  const activeLabel = useSelector(
    (state: any) => state.project.ui.selectedCategory
  );

  const handleLabelChosen = React.useCallback(
    (label) => {
      dispatch({
        type: "project/selectCategory",
        payload: label,
      });
    },
    [dispatch]
  );

  return (
    <Select
      labels={labels}
      activeLabel={activeLabel}
      onChange={handleLabelChosen}
    />
  );
}

export default ActiveLabel;
