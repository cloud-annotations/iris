import React from "react";
import ActiveLabel from "./ActiveLabel";
import Counter from "./Counter";
// import ActiveLabel from "./ActiveLabel";

const moveStyle = {
  fill: "white",
};

const boxStyle = {
  fill: "white",
  fillOpacity: 0.2,
  stroke: "white",
  strokeWidth: 2,
};

const BoxToolPlugin = {
  activate(iris: any) {
    iris.tools.register({
      id: "move",
      priority: 100,
      icon: (
        <svg style={moveStyle} width="20" height="20" viewBox="0 0 40 40">
          <path d="M19,11h2V29H19V11Zm-8,8H29v2H11V19ZM21,35H19l-4-6H25ZM35,19v2l-6,4V15ZM5,21V19l6-4V25ZM19,5h2l4,6H15Z" />
        </svg>
      ),
    });

    iris.tools.register({
      id: "box2",
      priority: 0,
      icon: (
        <svg style={boxStyle} width="20" height="20" viewBox="0 0 40 40">
          <rect x="4" y="2" width="10" height="10" />
        </svg>
      ),
    });

    const boxTool = iris.tools.register({
      id: "box",
      icon: (
        <svg style={boxStyle} width="20" height="20" viewBox="0 0 40 40">
          <rect x="4" y="8" width="32" height="24" />
        </svg>
      ),
    });

    boxTool.options.register({
      component: <div>bye</div>,
    });

    boxTool.options.register({
      component: <div>hello world</div>,
      priority: 10,
    });

    boxTool.options.register({
      component: <Counter />,
      priority: 12,
    });

    boxTool.options.register({
      component: <ActiveLabel />,
      priority: 100,
    });

    boxTool.options.register({
      component: <div>hello world bloo</div>,
      priority: 9,
    });
  },
};

export default BoxToolPlugin;
