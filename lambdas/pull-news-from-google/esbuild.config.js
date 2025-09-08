// esbuild.config.js
const fs = require("fs");

module.exports = () => ({
  plugins: [
    {
      name: "jsdom-xhr-sync-worker-fix",
      setup(build) {
        const filter =
          /jsdom\/lib\/jsdom\/living\/xhr\/XMLHttpRequest-impl\.js$/;
        build.onLoad({ filter }, async (args) => {
          let contents = await fs.promises.readFile(args.path, "utf8");
          contents = contents.replace(
            'require.resolve("./xhr-sync-worker.js")',
            `"${require.resolve(
              "jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js"
            )}"`
          );
          return { contents, loader: "js" };
        });
      },
    },
  ],
});
