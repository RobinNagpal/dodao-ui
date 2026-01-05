// scripts/generate-events.ts
// Prints a single-line JSON event to STDOUT for serverless invoke local
// Usage:
//   npx tsx scripts/generate-events.ts --route generateSlide
//   npx tsx scripts/generate-events.ts --route concatenateVideos
//   npx tsx scripts/generate-events.ts --route options

type HttpMethod = "POST" | "OPTIONS" | "GET";

type Args = {
  route: string;
  origin: string;
};

function getArg(key: string, dflt?: string): string {
  const argv = process.argv.slice(2);
  const i = argv.indexOf(key);
  if (i >= 0 && argv[i + 1]) return argv[i + 1];
  const kv = argv.find((a) => a.startsWith(`${key}=`));
  if (kv) return kv.split("=").slice(1).join("=");
  if (dflt !== undefined) return dflt;
  throw new Error(`Missing required arg ${key}`);
}

function parseArgs(): Args {
  const route = getArg("--route", "generateSlide");
  const origin = getArg("--origin", "http://localhost:3000");
  return { route, origin };
}

type Mapping = { method: HttpMethod; path: string; body?: any };

const MAP: Record<string, Mapping> = {
  // Generate single slide
  generateSlide: {
    method: "POST",
    path: "/generate-slide",
    body: {
      slide: {
        id: "test-001",
        type: "bullets",
        title: "Test Slide",
        bullets: ["Point one", "Point two", "Point three"],
        narration: "This is a test narration for the slide.",
      },
      outputBucket: "test-bucket",
      outputPrefix: "test/",
    },
  },

  // Concatenate videos
  concatenateVideos: {
    method: "POST",
    path: "/concatenate-videos",
    body: {
      videoUrls: ["test/videos/test-001.mp4", "test/videos/test-002.mp4"],
      outputBucket: "test-bucket",
      outputKey: "test/final/concatenated.mp4",
    },
  },

  // Health check
  health: {
    method: "GET",
    path: "/health",
  },

  // OPTIONS preflight
  options: {
    method: "OPTIONS",
    path: "/generate-slide",
  },
};

function httpApiV2EventPOST(path: string, body: unknown) {
  return {
    version: "2.0",
    routeKey: `POST ${path}`,
    rawPath: path,
    rawQueryString: "",
    headers: { "content-type": "application/json" },
    requestContext: { http: { method: "POST", path } },
    body: JSON.stringify(body),
    isBase64Encoded: false,
  };
}

function httpApiV2EventGET(path: string) {
  return {
    version: "2.0",
    routeKey: `GET ${path}`,
    rawPath: path,
    rawQueryString: "",
    headers: {},
    requestContext: { http: { method: "GET", path } },
    body: null,
    isBase64Encoded: false,
  };
}

function httpApiV2EventOPTIONS(path: string, origin: string) {
  return {
    version: "2.0",
    routeKey: `OPTIONS ${path}`,
    rawPath: path,
    rawQueryString: "",
    headers: {
      origin,
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type",
    },
    requestContext: { http: { method: "OPTIONS", path } },
    body: null,
    isBase64Encoded: false,
  };
}

function main() {
  const { route, origin } = parseArgs();

  const mapping = MAP[route];
  if (!mapping) {
    console.error(`Unknown route: ${route}`);
    console.error(`Available routes: ${Object.keys(MAP).join(", ")}`);
    process.exit(1);
  }

  let event: unknown;

  switch (mapping.method) {
    case "POST":
      event = httpApiV2EventPOST(mapping.path, mapping.body);
      break;
    case "GET":
      event = httpApiV2EventGET(mapping.path);
      break;
    case "OPTIONS":
      event = httpApiV2EventOPTIONS(mapping.path, origin);
      break;
  }

  // Print single-line JSON to stdout
  console.log(JSON.stringify(event));
}

try {
  main();
} catch (e: any) {
  console.error(e.message);
  process.exit(1);
}
