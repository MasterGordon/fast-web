const formatBytes = (bytes: number) => {
  if (bytes > 1024 * 1024 * 1024) {
    return Math.floor((bytes * 100) / (1024 * 1024 * 1024)) / 100 + "GB";
  }
  if (bytes > 1024 * 1024) {
    return Math.floor((bytes * 100) / (1024 * 1024)) / 100 + "MB";
  }
  if (bytes > 1024) {
    return Math.floor((bytes * 100) / 1024) / 100 + "KB";
  }
  return bytes + "B";
};

export const requestLog = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request) => {
    const start = performance.now();
    const response = await handler(req);
    const bytes = await response.clone().bytes();
    const delta = performance.now() - start;
    console.log(
      `[${req.method}] ${req.url} -> ${response.headers.get("Content-Type")} ${formatBytes(bytes.length)} in ${delta}ms`,
    );
    return response;
  };
};
