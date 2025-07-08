import { crazyHash } from "~/system/crazyHash";
import { getHandlers, getStates, getUrl } from "./fast-web";
import type { CreateStateResult } from "./state";

export const useUrl = (): URL => {
  return getUrl();
};

export const useParams = (): URLSearchParams => {
  return getUrl().searchParams;
};

export const usePath = (): string => {
  return getUrl().pathname;
};

export const useState = <S, T extends string>(
  state: CreateStateResult<S, T>,
) => {
  const handlerId = state.meta.hash;
  const handlers = getHandlers();
  handlers[handlerId] = state.meta.path;
  const stateId = crazyHash(Bun.randomUUIDv7());
  const parts = Object.keys(state.handler);
  getStates()[stateId] = {
    handlerId,
    state: state.initial,
  };
  return Object.fromEntries(
    parts.map((part) => [
      part,
      {
        "data-c": part + "-" + stateId,
      },
    ]),
  ) as unknown as Record<T, Record<`data-${string}`, string>>;
};
