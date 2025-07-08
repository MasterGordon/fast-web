import { useState } from "~/lib/hooks";
import counterState from "./Counter.state";

export const Counter = () => {
  const { sub, counter, add } = useState(counterState);

  return (
    <div>
      <button {...sub}>-</button>
      <span {...counter}>0</span>
      <button {...add}>+</button>
    </div>
  );
};
