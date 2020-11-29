import React, { useCallback } from "react";

import { useSelector, useDispatch } from "react-redux";

import { LabelSelect } from "@iris/components";
import { RootState, selectedCategorySelector } from "@iris/store";
import { addCategory } from "@iris/store/dist/project/data";
import { selectCategory } from "@iris/store/dist/project/ui";

function ActiveLabel() {
  const dispatch = useDispatch();
  const labels = useSelector((state: RootState) => state.data.categories);
  const activeLabel = useSelector(selectedCategorySelector);

  const handleLabelChosen = useCallback(
    (label) => {
      // only create new label if it doesn't exist to prevent unnecessary save.
      if (!labels.includes(label)) {
        dispatch(addCategory(label));
      }

      dispatch(selectCategory(label));
    },
    [dispatch, labels]
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
