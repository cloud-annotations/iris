import React from "react";

import { Story } from "@storybook/react/types-6-0";

import Select, { Props } from "./";

export default {
  title: "Example/Select",
  component: Select,
};

const Template: Story<Props> = (args) => {
  const [active, setActive] = React.useState(args.labels[0]);
  return (
    <Select
      {...args}
      activeLabel={active}
      onChange={(label) => {
        setActive(label);
      }}
    />
  );
};

export const Primary = Template.bind({});
Primary.args = {
  labels: ["bloop", "blop", "bleep"],
};
