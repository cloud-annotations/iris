import React, { useState } from "react";

import { Story } from "@storybook/react/types-6-0";

import Select, { Props } from "./";

export default {
  title: "components/LabelSelect",
  component: Select,
};

const Template: Story<Props> = (args) => {
  const [active, setActive] = useState(args.labels[0]);
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