import { myPlugin } from "./myPlugin";
import {
  fillTemplate,
  render,
  resolveLayoutPaths,
  wrapLayouts,
} from "./lib/fast-web";
import { requestLog } from "./middlewares/request-log";
import template from "./template.html" with { type: "text" };
import theme from "./theme.css" with { type: "text" };
import staticDir from "serve-static-bun";
import path from "path";
import { withMiddlewares } from "./middlewares/with-middlewares";
import { gzip } from "./middlewares/gzip";

const pagesDir = __dirname + "/pages";

const router = new Bun.FileSystemRouter({
  style: "nextjs",
  dir: pagesDir,
});

const staticPublic = staticDir("./public");

const scriptsGlob = new Bun.Glob(__dirname + "/scripts/*");

const server = Bun.serve({
  port: 8080,
  fetch: withMiddlewares(
    async (req): Promise<Response> => {
      if (req.url.endsWith("ws")) {
        if (server.upgrade(req)) return new Response("ok");
      }

      const match = router.match(req);
      if (!match) return staticPublic(req);
      const layouts = await resolveLayoutPaths(
        path.join(pagesDir, match.src),
        pagesDir,
      );
      const Comp = (await import(path.join(pagesDir, match.src))).default;
      const renderResult = await render(
        await wrapLayouts(<Comp />, layouts),
        [theme],
        new URL(req.url),
      );

      const systemScripts = await Bun.build({
        entrypoints: [
          ...scriptsGlob.scanSync(),
          "./src/components/Counter.state.ts",
        ],
        minify: true,
        plugins: [myPlugin],
      });
      const scripts = await Promise.all(
        systemScripts.outputs.map(
          async (script) =>
            `<script type="module">${await script.text()}</script>`,
        ),
      );

      const responseData = fillTemplate(template, {
        head: renderResult.head + scripts.join(""),
        body: renderResult.html,
      });

      return new Response(responseData, {
        headers: {
          "content-type": "text/html",
        },
      });
    },
    requestLog(),
    gzip,
    requestLog("gzip"),
  ),
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
