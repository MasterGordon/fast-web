type Handler = (req: Request) => Promise<Response>;

export const withMiddlewares = (
  fetchFn: Handler,
  ...handlers: ((handler: Handler) => Handler)[]
) => {
  return async (req: Request) => {
    return handlers.reduce((acc, c) => {
      return c(acc);
    }, fetchFn)(req);
  };
};
