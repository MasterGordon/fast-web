type StateContext<S extends any, T extends string> = Record<
  `$${T}`,
  HTMLElement
> & {
  get: () => S;
  set: (state: Partial<S>) => void;
};

type StateHandler<S extends any, T extends string> = Record<
  T,
  (ctx: StateContext<S, T>) => {
    onClick?: (event: MouseEvent) => void;
  }
>;

interface StateMeta {
  path: string;
  hash: string;
}

interface StateRegistryEntry<S, T extends string> {
  handler: StateHandler<S, T>;
}

interface StateManager {
  init: boolean;
  states: Record<string, { state: any; handlerId: string }>;
  stateRegistry: Map<string, StateRegistryEntry<any, string>>;
}

interface MyWindow extends Window {
  stateManager: StateManager;
}

declare let window: MyWindow;

const stateManager: StateManager =
  typeof window !== "undefined" && "stateManager" in window
    ? window.stateManager
    : {
        init: false,
        states: {},
        stateRegistry: new Map(),
      };

export type CreateStateResult<S, T extends string> = {
  meta: StateMeta;
  initial: S;
  handler: StateHandler<S, T>;
};

export const createState = <S, T extends string>(
  initialState: S,
  stateHandler: StateHandler<S, T>,
  meta?: StateMeta,
): CreateStateResult<S, T> => {
  if (!meta) {
    throw new Error("Missing meta please check if bun plugin is loaded");
  }
  if (!stateManager.stateRegistry.has(meta.hash)) {
    stateManager.stateRegistry.set(meta.hash, {
      handler: stateHandler,
    });
  }
  return {
    meta,
    initial: initialState,
    handler: stateHandler,
  };
};

if (!stateManager.init && typeof window != "undefined") {
  stateManager.init = true;
  window.stateManager = stateManager;
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target.dataset["c"]) {
      const [part, stateId] = target.dataset["c"].split("-");
      const { handler } = stateManager.stateRegistry.get(
        stateManager.states[stateId].handlerId,
      )!;
      const parts = Object.keys(handler);
      const { state } = stateManager.states[stateId];
      const context = Object.fromEntries([
        ["get", () => state],
        [
          "set",
          (newState: any) => {
            stateManager.states[stateId].state = { ...state, ...newState };
          },
        ],
        ...parts.map((part) => [
          `$$${part}`,
          document.querySelector(`[data-c=${part}-${stateId}]`),
        ]),
      ]);
      handler[part](context).onClick?.(e);
    }
  });
}
