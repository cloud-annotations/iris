import React from "react";

import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";

interface IOption {
  label: string;
  inputValue?: string;
}

export interface Props {
  value: IOption | null;
  options: IOption[];
  onChange: (option: IOption | null) => void;
  onCreate: (option: IOption) => void;
}

const filter = createFilterOptions<IOption>();

function CreateableSelect({ value, options, onChange, onCreate }: Props) {
  return (
    <Autocomplete
      value={value}
      onChange={(_event, newValue) => {
        if (typeof newValue === "string") {
          onChange({
            label: newValue,
          });
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          onCreate({
            label: newValue.inputValue,
          });
        } else {
          onChange(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        // Suggest the creation of a new value
        if (params.inputValue !== "") {
          filtered.push({
            inputValue: params.inputValue,
            label: `Create label "${params.inputValue}"`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={options}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.label;
      }}
      renderOption={(option) => option.label}
      style={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label="Free solo with text demo"
          variant="outlined"
        />
      )}
    />
  );
}

export default CreateableSelect;
