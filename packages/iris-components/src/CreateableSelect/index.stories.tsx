import React from "react";

import { Story } from "@storybook/react/types-6-0";

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
    <CreateableSelect
      {...args}
      value={val}
      onChange={setVal}
      onCreate={setVal}
    />
  );
};

export const Primary = Template.bind({});
Primary.args = {
  value: null,
  options: options,
  onChange: () => {},
  onCreate: () => {},
};
