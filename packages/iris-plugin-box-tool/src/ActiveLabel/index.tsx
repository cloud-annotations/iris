import React, { useCallback } from "react";

import { selectCategory } from "@iris/store/dist/project/ui";
import { useSelector, useDispatch } from "react-redux";

import { LabelSelect } from "@iris/components";
import { RootState } from "@iris/store";

function ActiveLabel() {
  const dispatch = useDispatch();
  const labels = useSelector((state: RootState) => state.data.categories);
  const activeLabel = useSelector(
    (state: RootState) => state.ui.selectedCategory
  );

  const handleLabelChosen = useCallback(
    (label) => {
      dispatch(selectCategory(label));
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
