import React from "react";

import { Story } from "@storybook/react/types-6-0";

import Canvas from "./";

export default {
  title: "components/Canvas",
  component: Canvas,
};

const Template: Story<any> = (args) => <Canvas {...args} />;

export const Primary = Template.bind({});
