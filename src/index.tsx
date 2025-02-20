import { fillTemplate, render } from "./lib/fast-web";
import template from "./template.html" with { type: "text" };
import theme from "./theme.css" with { type: "text" };
import staticDir from "serve-static-bun";

const router = new Bun.FileSystemRouter({
  style: "nextjs",
  dir: __dirname + "/pages",
});

const staticPublic = staticDir("./public");

const glob = new Bun.Glob(__dirname + "/scripts/*");

const server = Bun.serve({
  port: 8080,
  fetch: async (req): Promise<Response> => {
    if (req.url.endsWith("ws")) {
      if (server.upgrade(req)) return new Response("ok");
    }

    const match = router.match(req);
    if (!match) return staticPublic(req);
    const Comp = (await import(__dirname + "/pages/" + match?.pathname))
      .default;
    const renderResult = render(<Comp />, [theme]);

    const systemScripts = await Bun.build({
      entrypoints: [...glob.scanSync()],
      minify: true,
    });
    const scripts = await Promise.all(
      systemScripts.outputs.map(
        async (script) => `<script>${await script.text()}</script>`,
      ),
    );

    return new Response(
      fillTemplate(template, {
        head: renderResult.head + scripts,
        body: renderResult.html,
      }),
      {
        headers: {
          "content-type": "text/html",
        },
      },
    );
  },
  websocket: {
    message: () => {},
    open: async (ws) => {
      console.log("connected");
      ws.subscribe("reload");
    },
  },
});

server.publish("reload", "reload");

console.log("Listening on http://localhost:8080");
