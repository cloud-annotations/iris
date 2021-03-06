import React from "react";

import { SvgIcon, SvgIconProps } from "@material-ui/core";

function Chevron(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 32 32" {...props}>
      <path d="M22 16L12 26l-1.4-1.4 8.6-8.6-8.6-8.6L12 6z"></path>
    </SvgIcon>
  );
}

export default Chevron;
