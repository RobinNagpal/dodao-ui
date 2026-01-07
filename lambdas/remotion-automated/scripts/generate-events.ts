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
  // === Legacy Endpoints ===

  // Generate single slide (legacy)
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
      outputBucket: "remotionlambda-useast1-ele686axd8",
      outputPrefix: "test/",
    },
  },

  // Concatenate videos
  concatenateVideos: {
    method: "POST",
    path: "/concatenate-videos",
    body: {
      videoUrls: ["test/videos/test-001.mp4", "test/videos/test-002.mp4"],
      renderIds: ["render-id-001", "render-id-002"],
      outputBucket: "remotionlambda-useast1-ele686axd8",
      outputKey: "test/final/concatenated.mp4",
    },
  },

  // Get render status
  renderStatus: {
    method: "POST",
    path: "/render-status",
    body: {
      renderId: "test-render-id",
      bucketName: "remotionlambda-useast1-ele686axd8",
    },
  },

  // === New Endpoints ===

  // Save preferences
  savePreferences: {
    method: "POST",
    path: "/save-preferences",
    body: {
      presentationId: "test-presentation-001",
      outputBucket: "remotionlambda-useast1-ele686axd8",
      voice: "en-US-JennyNeural",
      slides: [
        {
          slideNumber: "01",
          slide: {
            id: "001",
            type: "title",
            title: "Welcome to Our Presentation",
            subtitle: "An Introduction to Testing",
            narration:
              "Welcome to our presentation. Today we will explore the world of automated testing and video generation.",
          },
        },
        {
          slideNumber: "02",
          slide: {
            id: "002",
            type: "bullets",
            title: "Key Points",
            bullets: [
              "First important point about our topic",
              "Second crucial aspect to consider",
              "Third element that ties everything together",
            ],
            bulletAccents: ["important point", "crucial aspect", "ties everything together"],
            narration:
              "Let's discuss the key points. First, we have an important point about our topic. Second, there's a crucial aspect to consider. And third, an element that ties everything together.",
          },
        },
      ],
    },
  },

  // Generate from prompt (AI generation)
  generateFromPrompt: {
    method: "POST",
    path: "/generate-from-prompt",
    body: {
      presentationId: "ai-generated-001",
      prompt:
        "Create a presentation about the benefits of remote work. Include statistics, productivity tips, and work-life balance aspects.",
      numberOfSlides: 5,
      additionalInstructions: "Make it engaging and use data from recent studies.",
      outputBucket: "remotionlambda-useast1-ele686axd8",
      voice: "en-US-JennyNeural",
    },
  },

  // Generate slide image
  generateSlideImage: {
    method: "POST",
    path: "/generate-slide-image",
    body: {
      presentationId: "test-presentation-001",
      slideNumber: "01",
      outputBucket: "remotionlambda-useast1-ele686axd8",
    },
  },

  // Generate slide audio
  generateSlideAudio: {
    method: "POST",
    path: "/generate-slide-audio",
    body: {
      presentationId: "test-presentation-001",
      slideNumber: "01",
      outputBucket: "remotionlambda-useast1-ele686axd8",
      voice: "en-US-JennyNeural",
    },
  },

  // Generate slide video only (requires existing audio)
  generateSlideVideo: {
    method: "POST",
    path: "/generate-slide-video",
    body: {
      presentationId: "test-presentation-001",
      slideNumber: "01",
      outputBucket: "remotionlambda-useast1-ele686axd8",
    },
  },

  // Generate slide all (audio + image + video)
  generateSlideAll: {
    method: "POST",
    path: "/generate-slide-all",
    body: {
      presentationId: "test-presentation-001",
      slideNumber: "01",
      outputBucket: "remotionlambda-useast1-ele686axd8",
      voice: "en-US-JennyNeural",
    },
  },

  // Get presentation status
  presentationStatus: {
    method: "POST",
    path: "/presentation-status",
    body: {
      presentationId: "test-presentation-001",
      outputBucket: "remotionlambda-useast1-ele686axd8",
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
