import { Didact } from "../lib/Didact";
/** @jsx Didact.createElement */

const Log = ({ message, children }) => {
  console.log(message);
  return <div id="log">Test</div>;
};

export default Log;
