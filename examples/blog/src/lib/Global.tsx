import { renderStyle } from "~/system/style-rules";
import { pushStyle } from "./fast-web";
import type { Styles } from "~/types";

interface GlobalProps {
  css?: Record<string, Styles>;
}

export default function Global({ css = {} }: GlobalProps) {
  Object.entries(css).forEach(([key, value]) => {
    const style = renderStyle(value, key);
    pushStyle(style.css);
  });

  return null;
}
