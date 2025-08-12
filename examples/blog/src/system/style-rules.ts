import { pseudoClasses, type Styles } from "~/types";
import { getCategory, shorthand } from "./token-categories";
import { crazyHash } from "./crazyHash";

export const camelToKebab = (str: string) => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
};

const resolveVars = (key: string, value: string) => {
  const match = value.match(/\$([a-zA-Z0-9\.\-]+)/g);
  if (match) {
    const category = getCategory(key);
    const replaceValue = match.reduce((v, m) => {
      return v.replace(
        m,
        `var(--${category}${m.replaceAll("$", "").replaceAll(".", "-")})`,
      );
    }, value);
    return replaceValue;
  }
  return value;
};

const renderRule = (key: string, value: string | number | string[]): string => {
  const kKey = camelToKebab(key);
  if (typeof value === "number") {
    return `${kKey}: ${value}px;`;
  }
  if (typeof value === "string") {
    return `${kKey}: ${resolveVars(key, value)};`;
  }
  return `${kKey}: ${value.join(" ")};`;
};

const partitionStyles = (style: Styles) => {
  const selectorStylesMapping: Record<
    string,
    Record<string, string | number | string[]>
  > = {
    "&": {},
  };

  for (const [key, value] of Object.entries(style)) {
    if (typeof value === "object" && !Array.isArray(value)) {
      const selector =
        pseudoClasses[key.substring(1) as keyof typeof pseudoClasses] ?? key;
      selectorStylesMapping[selector] = value;
    } else {
      selectorStylesMapping["&"][key] = value;
    }
  }
  return selectorStylesMapping;
};

const resolveShorthand = (
  key: string,
  value: string | number | string[],
): { key: string; value: string | number | string[] }[] => {
  if (key in shorthand) {
    return shorthand[key as keyof typeof shorthand](value);
  }
  return [{ key, value }];
};

export const getStyleRules = (style: Styles) => {
  const selectorStylesMapping = partitionStyles(style);
  const rules: Record<string, string[]> = {};
  for (const [selector, styles] of Object.entries(selectorStylesMapping)) {
    const stylePairs = Object.entries(styles).reduce(
      (acc, [key, value]) => {
        const resolvedShorthand = resolveShorthand(key, value);
        return [...acc, ...resolvedShorthand];
      },
      [] as { key: string; value: string | number | string[] }[],
    );
    rules[selector] = stylePairs.map(({ key, value }) => {
      return renderRule(key, value);
    });
  }
  return rules;
};

const getRulesClassName = (rules: Record<string, string[]>) => {
  const flatRules = Object.values(rules).flat();
  flatRules.push(...Object.keys(rules));
  const sortedRules = flatRules.sort();
  const rulesString = sortedRules.join(";");
  return `f${crazyHash(rulesString)}`;
};

export const renderStyle = (style: Styles, selectorOverride?: string) => {
  const rulesMapping = getStyleRules(style);
  const className = selectorOverride ?? getRulesClassName(rulesMapping);
  let css = "";
  for (const [selector, rules] of Object.entries(rulesMapping)) {
    css += `${selector.replaceAll("&", selectorOverride ?? "." + className)} {${rules.join(" ")}}`;
  }
  return { className, css };
};
