import { createRootFiber, render } from "./cr";

const App = () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <main>
      <div>Hello world</div>
      <ul>
        {items.map((item) => (
          <li key={item}>{String(item)}</li>
        ))}
      </ul>
    </main>
  );
};

console.log("foo");
const root = createRootFiber(document.getElementById("app")!);
console.log(<div>Hello World</div>);
render(root, <App />);
