import { createState } from "~/lib/state";

export default createState(
  { value: 0 },
  {
    add: (ctx) => ({
      onClick: () => {
        const { value } = ctx.get();
        ctx.set({ value: value + 1 });
        ctx.$counter.innerText = String(value + 1);
      },
    }),
    counter: (_ctx) => ({}),
    sub: (ctx) => ({
      onClick: () => {
        const { value } = ctx.get();
        ctx.set({ value: value - 1 });
        ctx.$counter.innerText = String(value - 1);
      },
    }),
  },
);
