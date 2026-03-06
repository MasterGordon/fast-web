import { createRootFiber, logFiber, render, scheduleRerender } from "./cr";
import { domFiber } from "./symbols";

let renderCount = 0;

const Child = () => {
  logFiber("Child");
  return <div>Child</div>;
};

const App = () => {
  console.log("render");
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div
      id="foo"
      onClick={(e) => {
        const fiber = (e.target as HTMLElement)[domFiber];
        scheduleRerender(fiber!);
      }}
    >
      Hello world {String(++renderCount)}
      <Child />
    </div>
  );
};

const root = createRootFiber(document.getElementById("app")!);
render(root, <App />);
