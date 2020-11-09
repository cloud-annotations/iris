import React, { useCallback } from "react";

import { addCategory } from "@iris/store/dist/project/data";
import { selectCategory } from "@iris/store/dist/project/ui";
import { useSelector, useDispatch } from "react-redux";

import { LabelSelect } from "@iris/components";
import { RootState, selectedCategorySelector } from "@iris/store";

function ActiveLabel() {
  const dispatch = useDispatch();
  const labels = useSelector((state: RootState) => state.data.categories);
  const activeLabel = useSelector(selectedCategorySelector);

  const handleLabelChosen = useCallback(
    (label) => {
      // will only create a new category if it doesn't exist
      dispatch(addCategory(label));
      dispatch(selectCategory(label));
    },
    [dispatch]
  );

  return (
    <LabelSelect
      labels={labels}
      activeLabel={activeLabel}
      placeholder="Create new label"
      onChange={handleLabelChosen}
    />
  );
}

export default ActiveLabel;
