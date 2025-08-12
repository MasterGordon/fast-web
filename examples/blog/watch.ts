import { watch } from "chokidar";
import path from "path";

const server = Bun.serve({
  port: 8081,
  fetch: async (req): Promise<Response> => {
    if (req.url.endsWith("ws")) {
      if (server.upgrade(req)) return new Response("ok");
    }
    return new Response("ok");
  },
  websocket: {
    message: () => {},
    open: async (ws) => {
      console.log("connected");
      ws.subscribe("reload");
    },
    close: () => {
      console.log("dc");
    },
  },
});

const watcher = watch(path.join(__dirname, "src"), {
  persistent: true,
  atomic: true,
  ignoreInitial: true,
  usePolling: true,
  interval: 50,
});

let p = Bun.spawn(
  [path.join(process.env.HOME!, ".bun/bin/bun"), "src/index.tsx"],
  {
    stdout: "inherit",
    env: {
      DEV: "1",
    },
  },
);

let timer: Timer | undefined;
const reload = async () => {
  p.kill();
  await p.exited;
  p = Bun.spawn(
    [path.join(process.env.HOME!, ".bun/bin/bun"), "src/index.tsx"],
    {
      stdout: "inherit",
    },
  );
  setTimeout(() => server.publish("reload", "reload"), 50);
};

watcher.on("all", async () => {
  console.log("WATCHER TRIGGERED");
  clearTimeout(timer);
  timer = setTimeout(reload, 50);
});
