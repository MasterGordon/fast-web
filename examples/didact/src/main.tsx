import Log from "./components/Log";
import { Didact } from "./lib/Didact";
import logo from "./typescript.svg";
/** @jsx Didact.createElement */

const e = (
  <div id="foo">
    Hello
    <section>
      <img src={logo} onClick={() => alert("Test")} />
    </section>
  </div>
);

const App = (props) => {
  const [count, setCount] = Didact.useState(1);

  return (
    <div id="foo">
      Hello {props.name}
      <br />
      Count: {count()}
      <Log message="1">Log1</Log>
      <Log message="2">
        <Log message="2">Log2</Log>
        <Log message="3">Log3</Log>
      </Log>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      <button onClick={() => setCount((c) => c - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
};

Didact.render(<App name="Gordon" />, document.getElementById("app")!);
