import { camelToKebab, renderStyle } from "~/system/style-rules";
import { transform } from "lightningcss";
import reset from "./reset.css" with { type: "text" };
import { AsyncLocalStorage } from "async_hooks";

interface RenderContext {
  styles: string[];
  url: URL;
  states: Record<string, { state: any; handlerId: string }>;
  // Mapping handlerHash to file
  handlers: Record<string, string>;
}

const asyncLocalStorage = new AsyncLocalStorage<RenderContext>();

const renderChildren = async (elements: JSX.Children): Promise<string> => {
  if (Array.isArray(elements)) {
    return (
      await Promise.all(elements.map((element) => renderChildren(element)))
    ).join("");
  }
  if (typeof elements === "string") {
    return elements;
  }
  return renderElement(elements);
};

const getStyles = () => asyncLocalStorage.getStore()!.styles;
export const getUrl = () => asyncLocalStorage.getStore()!.url;
export const getHandlers = () => asyncLocalStorage.getStore()!.handlers;
export const getStates = () => asyncLocalStorage.getStore()!.states;

export const pushStyle = (...styles: string[]) => {
  getStyles().push(...styles);
};

const renderElement = async (
  element: JSX.Element | string | null | undefined,
): Promise<string> => {
  if (!element) {
    return "";
  }
  if (typeof element === "string") {
    return element;
  }
  if (element.$$typeof === Symbol.for("fast.fragment")) {
    return renderChildren(element.children);
  }
  if (typeof element.type === "string") {
    let { className, ...otherProps } = element.props;
    if ("style" in element.props) {
      const res = renderStyle(element.props.style);
      pushStyle(res.css);
      className = className ? `${className} ${res.className}` : res.className;
    }
    const props = { ...otherProps, class: className };
    const attrs = Object.entries(props).map(([key, value]) => {
      if (key === "children") {
        return "";
      }
      if (key === "style") {
        return "";
      }
      if (!value) {
        return "";
      }
      return ` ${camelToKebab(key)}="${value}"`;
    });
    return `<${element.type}${attrs.join("")}>${element.children ? await renderChildren(element.children) : ""}</${element.type}>`;
  }
  if (typeof element.type === "function") {
    return renderElement(
      await element.type({ ...element.props, children: element.children }),
    );
  }
  return "";
};

const render = async (
  element: JSX.Element | string | null,
  extraCss: string[] = [],
) => {
  pushStyle(reset, ...extraCss);
  const html = await renderElement(element);
  const encoder = new TextEncoder();
  const css = transform({
    code: encoder.encode(getStyles().join("\n")),
    minify: true,
    filename: "render-style.ts",
  }).code;
  const head = `<style>${css.toString()}</style>
<script>
window.stateManager ??= {
  init: false,
  states: {},
  stateRegistry: new Map()
}
window.stateManager.states = {...window.stateManager.states,...${JSON.stringify(getStates())}}
</script>
`;
  return { html, head };
};

const runRender = (
  element: JSX.Element | string | null,
  extraCss: string[] = [],
  url: URL,
) => {
  return asyncLocalStorage.run(
    { styles: [], url, states: {}, handlers: {} },
    () => render(element, extraCss),
  );
};

export { runRender as render };

export const fillTemplate = (
  template: string,
  data: Record<string, string>,
) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    return acc.replace(`<!-- ${key} -->`, value);
  }, template);
};
