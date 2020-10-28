import React from "react";

import { Story } from "@storybook/react/types-6-0";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import theme from "@iris/theme";

import CreateableSelect, { Props } from "./";

export default {
  title: "Example/Button",
  component: CreateableSelect,
};

const options = [
  { label: "The Shawshank Redemption" },
  { label: "Pulp Fiction" },
  { label: "Fight Club" },
  { label: "Star Wars: Episode V - The Empire Strikes Back" },
];

const Template: Story<Props> = (args) => {
  const [val, setVal] = React.useState("boop");
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CreateableSelect
        {...args}
        value={val}
        onChange={setVal}
        onCreate={setVal}
      />
    </ThemeProvider>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  value: null,
  options: options,
  onChange: () => {},
  onCreate: () => {},
};
