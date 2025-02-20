import { camelToKebab, renderStyle } from "~/system/style-rules";
import { transform } from "lightningcss";
import reset from "./reset.css" with { type: "text" };

const renderChildren = (elements: JSX.Children): string => {
  if (Array.isArray(elements)) {
    return elements.map((element) => renderChildren(element)).join("");
  }
  if (typeof elements === "string") {
    return elements;
  }
  return renderElement(elements);
};

let styles: string[] = [];

export const pushStyle = (style: string) => {
  styles.push(style);
};

const renderElement = (
  element: JSX.Element | string | null | undefined,
): string => {
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
      styles.push(res.css);
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
    return `<${element.type}${attrs.join("")}>${element.children ? renderChildren(element.children) : ""}</${element.type}>`;
  }
  if (typeof element.type === "function") {
    return renderElement(
      element.type({ ...element.props, children: element.children }),
    );
  }
  return "";
};

export const render = (
  element: JSX.Element | string | null,
  extraCss: string[] = [],
) => {
  styles = [reset, ...extraCss];
  const html = renderElement(element);
  const encoder = new TextEncoder();
  const css = transform({
    code: encoder.encode(styles.join("\n")),
    minify: true,
    filename: "render-style.ts",
  }).code;
  const head = `<style>${css.toString()}</style>`;
  return { html, head };
};

export const fillTemplate = (
  template: string,
  data: Record<string, string>,
) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    return acc.replace(`<!-- ${key} -->`, value);
  }, template);
};
