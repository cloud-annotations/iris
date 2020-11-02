import React, { useState } from "react";

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
    mode: {
      control: {
        type: "radio",
        options: ["move", "draw"],
      },
    },
  },
};

const Template: Story<any> = (args) => {
  const [boxes, setBoxes] = useState([
    {
      x: 0,
      y: 0,
      width: 0.5,
      height: 0.5,
      color: "red",
      highlight: true,
    },
    { x: 0.2, y: 0.2, width: 0.6, height: 0.4, color: "cyan" },
  ]);

  return (
    <Canvas
      shapes={{
        box: boxes,
      }}
      render={{
        box: (c, box) => {
          c.drawBox(box, { color: box.color, highlight: box.highlight });
        },
      }}
      actions={{
        box: {
          onMove: (coords) => {
            console.log(coords);
          },
        },
      }}
      {...args}
    />
  );
};

export const Primary = Template.bind({});
Primary.args = {
  mode: "move",
  image:
    "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg",
  tool: "box",
};
