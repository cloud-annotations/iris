import React from "react";

import { Story } from "@storybook/react/types-6-0";

import Canvas from "./";

export default {
  title: "components/Canvas",
  component: Canvas,
  argTypes: {
    image: {
      control: {
        type: "radio",
        options: [
          "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg",
          "https://cdn.nsarco.com/skin/bop/images/home-page/dog-with-books.jpg",
        ],
      },
    },
  },
};

const Template: Story<any> = (args) => <Canvas {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  image:
    "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg",
};
