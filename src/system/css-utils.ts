import type { BaseCSSProperty, CSSDuration, EasingFunction } from "~/types";

type Transition =
  | [BaseCSSProperty]
  | [BaseCSSProperty, CSSDuration]
  | [BaseCSSProperty, CSSDuration, EasingFunction]
  | [BaseCSSProperty, CSSDuration, EasingFunction, CSSDuration];

export const transition = (transitions: Transition[]) => {
  return transitions.map((t) => t.join(" ")).join(",");
};
