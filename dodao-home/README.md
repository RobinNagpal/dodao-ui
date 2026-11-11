# dodao-home

The dodao.io marketing site. It is a fully static Next.js export (`next build` writes plain HTML to `out/`), served from S3 behind CloudFront. There is no server, API or database. Infrastructure lives in [`deployments/dodao-home`](../deployments/dodao-home/README.md).

## Run it

```bash
pnpm install        # once, from the repo root
cd dodao-home
pnpm dev            # http://localhost:3000
pnpm build && pnpm serve   # check the static export locally
```

Before pushing: `pnpm lint`, `pnpm prettier-check`, `pnpm compile`.

## Where things live

```
src/
  app/                              Routes (one folder per URL)
    page.tsx                        Home page
    robotics/[area]/                One page per robotics capability (data in roboticsAreas.ts)
    robotics/use-cases/[slug]/      One page per use case (data in useCases.ts)
    robotics/model-or-no-model/
    home-section/dodao-io/          Older AI & Web3 pages: products, services, education, research
    sitemap.ts                      Built from the page folders automatically
  components/
    home/DoDAOHome/                 Home page sections, top nav, footer, shared UI (SiteUi.tsx)
    home/DoDAOHome/products/        ProductPage template used by every product page
    robotics-page/areas/            Robotics capability pages and their content (roboticsAreas.ts)
    robotics-page/use-cases/        Use case pages, cards and their content (useCases.ts)
  images/                           Images imported in code (bundled by Next)
    DAO/                            Partner / client logos (TrustedBy)
    DoDAOHomePage/                  Product preview GIFs (home page and product pages)
  utils/siteConfig.ts               Site URL, title and description

public/                             Files served as-is at their path (e.g. /brand/dodao-logo-dark.svg)
  brand/                            DoDAO logos (all variants; keep unused ones for other uses)
  robotics/
    demos/                          Our own simulation and robot footage
    use-cases/<slug>/               Per use case: demo.mp4, demo-poster.jpg, card.jpg
    stock-footage/                  Placeholder stock video loops (Mixkit) + poster frames, to be replaced by our own
    stock-photos/                   Stock photos used on robotics capability cards
```

## Adding assets

- **Imported in a component** (logos, product images): put it in `src/images/` and `import` it, so Next sizes and fingerprints it.
- **Referenced by URL** (videos, posters, files linked from data such as `roboticsAreas.ts`): put it in the matching `public/` folder and use the path from `public/`, e.g. `/robotics/demos/my-clip.mp4`.
- Videos: H.264 MP4, no audio, `-movflags +faststart`, a few MB each (`ffmpeg -i in.mov -an -c:v libx264 -crf 27 -preset slow -movflags +faststart out.mp4`).
- Name files by what they show (`ur-arm-pick-real.png`, not `image_2.png`), and delete an asset when the last thing using it goes.

## Removing a page

Delete its folder under `src/app/`, then add its old URL to `REDIRECTS` in [`deployments/dodao-home/functions/viewer-request.js.tftpl`](../deployments/dodao-home/functions/viewer-request.js.tftpl) so existing links don't 404. Redirects go live with `terraform apply`.
