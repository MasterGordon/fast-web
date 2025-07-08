import type { CSSProperties } from "~/types";

const tokenTypes = [
  "color",
  "space",
  "font",
  "font-size",
  "font-weight",
  "border-radius",
] as const;
type TokenType = (typeof tokenTypes)[number];

export const shorthand = {
  marginX: <T>(value: T) => [
    {
      key: "marginLeft",
      value,
    },
    {
      key: "marginRight",
      value,
    },
  ],
  marginY: <T>(value: T) => [
    {
      key: "marginTop",
      value,
    },
    {
      key: "marginBottom",
      value,
    },
  ],
  mX: <T>(value: T) => [
    {
      key: "marginLeft",
      value,
    },
    {
      key: "marginRight",
      value,
    },
  ],
  mY: <T>(value: T) => [
    {
      key: "marginTop",
      value,
    },
    {
      key: "marginBottom",
      value,
    },
  ],
  paddingX: <T>(value: T) => [
    {
      key: "paddingLeft",
      value,
    },
    {
      key: "paddingRight",
      value,
    },
  ],
  paddingY: <T>(value: T) => [
    {
      key: "paddingTop",
      value,
    },
    {
      key: "paddingBottom",
      value,
    },
  ],
  pX: <T>(value: T) => [
    {
      key: "paddingLeft",
      value,
    },
    {
      key: "paddingRight",
      value,
    },
  ],
  pY: <T>(value: T) => [
    {
      key: "paddingTop",
      value,
    },
    {
      key: "paddingBottom",
      value,
    },
  ],
};

export const categoryMap = {
  color: "color",
  backgroundColor: "color",
  borderColor: "color",
  margin: "space",
  marginTop: "space",
  marginBottom: "space",
  marginLeft: "space",
  marginRight: "space",
  marginX: "space",
  marginY: "space",
  padding: "space",
  paddingTop: "space",
  paddingBottom: "space",
  paddingLeft: "space",
  paddingRight: "space",
  paddingX: "space",
  paddingY: "space",
  gap: "space",
  height: "space",
  width: "space",
  fontFamily: "font",
  fontSize: "font-size",
  fontWeight: "font-weight",
  borderRadius: "border-radius",
} as const satisfies Partial<Record<keyof CSSProperties, TokenType>>;

export const getCategory = (value: string) => {
  return value in categoryMap
    ? categoryMap[value as keyof typeof categoryMap] + "-"
    : "";
};
