import { getCategory, shorthand } from "./token-categories";

export const camelToKebab = (str: string) => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
};

export const getStyleRules = (style: JSX.CSSProperties) => {
  const styles = Object.entries(style).map(([key, value]) => {
    return {
      key,
      value,
    };
  });
  const rules = [];
  while (styles.length) {
    const { key, value } = styles.shift()!;
    if (key in shorthand) {
      const shorthandRules = shorthand[key as keyof typeof shorthand](value);
      styles.unshift(...shorthandRules);
      continue;
    }

    const kKey = camelToKebab(key);
    if (typeof value === "number") {
      rules.push(`${kKey}: ${value}px;`);
    } else if (typeof value === "string") {
      const match = value.match(/\$([a-zA-Z0-9\.\-]+)/g);
      if (match) {
        const category = getCategory(key);
        const replaceValue = match.reduce((v, m) => {
          return v.replace(
            m,
            `var(--${category}${m.replaceAll("$", "").replaceAll(".", "-")})`,
          );
        }, value);
        rules.push(`${kKey}: ${replaceValue};`);
      } else {
        rules.push(`${kKey}: ${value};`);
      }
    } else {
      rules.push(`${kKey}: ${value.join(" ")};`);
    }
  }
  return rules;
};

export const renderStyle = (style: JSX.CSSProperties) => {
  const rules = getStyleRules(style);
  const sortedRules = rules.sort();
  const rulesString = sortedRules.join(" ");
  const hash = Bun.hash(rulesString);
  const className = `style-${hash.toString(36)}`;
  const css = `.${className} {${rulesString}}`;
  return { className, css };
};
