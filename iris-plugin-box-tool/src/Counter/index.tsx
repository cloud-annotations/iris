import React, { useState } from "react";

function Counter() {
  const [val, setVal] = useState(0);
  return (
    <div>
      <button onClick={() => setVal((v) => v - 1)}>-</button>
      {val}
      <button onClick={() => setVal((v) => v + 1)}>+</button>
    </div>
  );
}

export default Counter;
