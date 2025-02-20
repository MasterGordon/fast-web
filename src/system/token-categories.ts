const tokenTypes = ["color", "space", "font"] as const;
type TokenType = (typeof tokenTypes)[number];

export const shorthand = {
  marginX: (value: string) => [
    {
      key: "marginLeft",
      value,
    },
    {
      key: "marginRight",
      value,
    },
  ],
  marginY: (value: string) => [
    {
      key: "marginTop",
      value,
    },
    {
      key: "marginBottom",
      value,
    },
  ],
  paddingX: (value: string) => [
    {
      key: "paddingLeft",
      value,
    },
    {
      key: "paddingRight",
      value,
    },
  ],
  paddingY: (value: string) => [
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
  fontFamily: "font",
} as const satisfies Partial<Record<keyof JSX.CSSProperties, TokenType>>;

export const getCategory = (value: string) => {
  return value in categoryMap
    ? categoryMap[value as keyof typeof categoryMap] + "-"
    : "";
};
