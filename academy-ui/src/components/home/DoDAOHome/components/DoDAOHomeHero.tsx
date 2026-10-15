import HeroClips, { HeroClip } from './HeroClips';
import { ActionLink } from './SiteUi';

export const CONTACT_MAILTO = 'mailto:info@dodao.com?subject=Robotics%20project';

// Placeholder stock footage (Mixkit free licence) until our own cell footage replaces it.
const clips: HeroClip[] = [
  { src: '/robotics/clips/lab-vials.mp4', poster: '/robotics/clips/lab-vials.jpg', label: 'Lab automation', caption: 'Vials placed into racks' },
  {
    src: '/robotics/clips/cluttered-picking.mp4',
    poster: '/robotics/clips/cluttered-picking.jpg',
    label: 'Picking from clutter',
    caption: 'Soft, mixed items in a tray',
  },
  {
    src: '/robotics/clips/industrial-cell.mp4',
    poster: '/robotics/clips/industrial-cell.jpg',
    label: 'Industrial cells',
    caption: 'Arms working in a shared cell',
  },
  { src: '/robotics/clips/gripper.mp4', poster: '/robotics/clips/gripper.jpg', label: 'Grasp design', caption: 'Gripper, fingertips and force' },
];

const tools = [
  'NVIDIA Isaac Sim',
  'Isaac Lab',
  'MuJoCo',
  'Gazebo',
  'ROS 2',
  'MoveIt 2',
  'cuRobo',
  'LeRobot',
  'ACT',
  'Diffusion Policy',
  'π0',
  'GR00T',
  'SmolVLA',
  'RF-DETR',
  'SAM 2',
  'PyTorch',
];

function ToolsMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-border bg-surface py-5">
      <p className="sr-only">Tools we work in: {tools.join(', ')}</p>
      <div className="dodao-marquee flex w-max gap-12 whitespace-nowrap" aria-hidden="true">
        {[...tools, ...tools].map((tool, index) => (
          <span key={`${tool}-${index}`} className="flex items-center gap-12 text-lg font-medium text-muted">
            {tool}
            <span className="h-1.5 w-1.5 rotate-45 bg-primary" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface to-transparent" />
    </div>
  );
}

export default function DoDAOHomeHero() {
  return (
    <>
      {/* Fills the window below the 4rem header so the clip tabs are always visible on load. */}
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-viewport">
        {/* Shade the footage so the copy stays readable */}
        <div className="pointer-events-none absolute inset-0 -z-[5] bg-gradient-to-r from-viewport via-viewport/75 to-viewport/20" />
        <div className="pointer-events-none absolute inset-0 -z-[5] bg-gradient-to-t from-viewport via-transparent to-viewport/40" />

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
          <div className="flex max-w-3xl flex-1 flex-col justify-center py-[clamp(1rem,3vh,2rem)] lg:py-[clamp(1.5rem,5vh,4rem)]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-on-viewport/10 px-3 py-1 text-sm text-on-viewport ring-1 ring-inset ring-on-viewport/20 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                Robotics engineering for manipulation
              </p>
              <h1 className="font-display mt-[clamp(1rem,2.5vh,1.5rem)] text-4xl font-semibold leading-[1.02] text-on-viewport sm:text-5xl lg:text-[clamp(2.75rem,min(5.5vw,7.5vh),4.75rem)]">
                Robot arms for the work that is hard to automate.
              </h1>
              <p className="mt-[clamp(1rem,2.5vh,1.5rem)] max-w-2xl text-base leading-7 text-on-viewport/85 sm:text-lg sm:leading-8">
                Bring us a task, like picking from a crowded bin, handling lab glassware or two arms passing parts. We take it from a simulated cell to a
                working robot on your floor, and use learned models only where they beat a programmed approach.
              </p>
              <div className="mt-[clamp(1.25rem,4vh,2.25rem)] flex flex-col gap-3 sm:flex-row">
                <ActionLink href={CONTACT_MAILTO} size="lg">
                  Start a project
                </ActionLink>
                <ActionLink href="#capabilities" size="lg" variant="onColor">
                  See what we build
                </ActionLink>
              </div>
            </div>
          </div>

          <HeroClips clips={clips} />
        </div>
      </section>
      <ToolsMarquee />
    </>
  );
}
