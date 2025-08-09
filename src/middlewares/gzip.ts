export const gzip = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request) => {
    const response = await handler(req);
    if (new URL(req.url).pathname == "/ws") return response;
    const bytes = await response.clone().bytes();
    const gzipped = Bun.gzipSync(bytes);
    return new Response(gzipped, {
      headers: { ...response.headers.toJSON(), "Content-Encoding": "gzip" },
      status: response.status,
      statusText: response.statusText,
    });
  };
};
