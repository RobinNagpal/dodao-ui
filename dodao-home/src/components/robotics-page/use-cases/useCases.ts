/**
 * Content for the robotics use cases on dodao.io.
 *
 * Used by the use case pages at `/robotics/use-cases/[slug]`, the homepage
 * "Use cases" section, the top nav and the footer. Facts come from the
 * project notes in robotics-lab-project (v1 pouring, v2 capping) and
 * robot-arm-projects (glass racking), read November 2026. On purpose, the
 * pages name the frameworks and the approach but leave out training data
 * sizes and success rates.
 *
 * Media lives in `public/robotics/use-cases/<slug>/`: `demo.mp4` (the captioned
 * demo), `demo-poster.jpg` (its first frame) and `card.jpg` (a clean still
 * for cards).
 */

export type UseCaseFact = {
  label: string;
  value: string;
};

export type UseCasePoint = {
  title: string;
  description: string;
};

export type UseCase = {
  slug: string;
  /** Short name used on cards and in menus. */
  name: string;
  /** One-line summary for cards and menus. */
  summary: string;
  /** Kind of work, shown as a tag. */
  sector: string;
  /** The simulator the demo runs in, shown beside the video. */
  simulator: string;
  title: string;
  lead: string;
  videoAlt: string;
  setup: UseCaseFact[];
  challenge: { intro: string; points: UseCasePoint[] };
  steps: UseCasePoint[];
  modelCall: { question: string; learned: string[]; programmed: string[]; howWeChose: string };
  decisions: UseCasePoint[];
  tools: string[];
  next: string[];
  /** Slugs of the robotics capability areas this use case draws on. */
  relatedAreas: string[];
};

export const useCases: UseCase[] = [
  {
    slug: 'test-tube-pouring',
    name: 'Pouring between test tubes',
    summary: 'Two arms find the tubes, pour one into another until it is exactly half full, and put both back.',
    sector: 'Lab automation',
    simulator: 'MuJoCo',
    title: 'Two arms that pour a test tube to exactly half full',
    lead: 'Nothing is known in advance: not how many tubes there are, how big they are, or how much liquid each holds. Two UR5e arms find out with their cameras, pour from one tube into another until it reaches the 50% mark, and put both tubes back in their racks.',
    videoAlt: 'Two robot arms pick up test tubes, pour liquid from one into the other while a network reads the level, then put both tubes back',
    setup: [
      { label: 'Robots', value: 'Two UR5e arms with Robotiq 2F-85 grippers' },
      { label: 'Simulation', value: 'MuJoCo, with the liquid as small particles so level and spills can be measured' },
      { label: 'Sensing', value: 'Overhead, wrist and pour cameras, plus joint readings' },
      { label: 'Learned parts', value: 'Finding the tubes, choosing a grasp, reading the level' },
    ],
    challenge: {
      intro: 'Pouring looks simple until the arm has to stop at exactly the right moment, in a tube it has never measured.',
      points: [
        {
          title: 'Nothing is known up front',
          description: 'The arms are not told how many tubes there are, how big they are or where they stand. Everything comes from camera images.',
        },
        {
          title: 'Every pour starts differently',
          description: 'The angle where liquid starts to flow depends on how full the source tube is, and that is not known.',
        },
        {
          title: 'Different sizes pour differently',
          description: 'Half full is a different volume in each tube size, and each size pours differently at the same angle.',
        },
        {
          title: 'Liquid keeps falling after you stop',
          description: 'Drops already in the air still land, so the arm has to start tilting back before the tube reaches its mark.',
        },
      ],
    },
    steps: [
      {
        title: 'Find every tube and rack',
        description:
          'The overhead camera finds each rack and tube and measures its height. The wrist camera checks which tubes hold liquid, which decides which rack is which.',
      },
      {
        title: 'Choose a pair',
        description: 'A coordinator matches an empty tube with a full one of the same size, and checks both can be grasped before either arm moves.',
      },
      {
        title: 'Pick up and meet',
        description:
          'Arm B lifts the full tube from the side and waits. Arm A carries the empty tube to the pouring point, then Arm B brings the full one in beside it.',
      },
      {
        title: 'Pour while watching the level',
        description:
          'A camera watches the receiving tube. A network reads the level, the flow and the drops still falling, and the arm tilts back early so the last drops land on the mark.',
      },
      {
        title: 'Put everything back',
        description: 'Arm B returns the source tube to its own cell, and Arm A sets the filled tube in the destination rack.',
      },
    ],
    modelCall: {
      question: 'Which steps needed a learned model?',
      learned: [
        'Finding and sizing tubes in the overhead image (YOLO)',
        'Choosing a grasp that clears the neighbouring tubes, from a depth image',
        'Reading the level and the flow from the pour camera (a CNN)',
      ],
      programmed: [
        'Coordinating the two arms and the order of moves',
        'Every arm motion, from picking to putting back',
        'The tilt itself, driven by the network’s reading',
      ],
      howWeChose:
        'A hand-written rule read the level less well than a network, above all the flow, which is what decides when to stop. So a network does the seeing and the movement stays programmed, which keeps it predictable and easy to check. We also trained an ACT policy that drives the pour directly, and kept it as a comparison.',
    },
    decisions: [
      {
        title: 'Only what a real robot can sense',
        description: 'Every decision uses camera images and joint readings. The simulator’s own knowledge of where things are is used only to grade the run.',
      },
      {
        title: 'Hold tubes from the side',
        description: 'Both arms grip from the side, so the openings stay clear for the pour.',
      },
      {
        title: 'One coordinator, one arm moving at a time',
        description:
          'A single program gives each arm its job and waits for it to report back, the way a cell planner talks to arms over ROS. When the arms are close, only one moves.',
      },
      {
        title: 'Stop early, on purpose',
        description: 'The tilt back starts before the mark, timed from what the camera sees still falling.',
      },
    ],
    tools: ['MuJoCo', 'UR5e', 'Robotiq 2F-85', 'YOLO11', 'PyTorch', 'ACT', 'Python'],
    next: [
      'Screw caps on the full source tubes, opened without spilling',
      'All three tube sizes, including the smallest',
      'Retrying automatically after a missed pick',
    ],
    relatedAreas: ['simulation', 'perception', 'learning'],
  },
  {
    slug: 'tube-uncapping',
    name: 'Uncapping screw-cap tubes',
    summary: 'One arm holds the tube while the other unscrews the cap, feeling through its wrist when the cap comes free.',
    sector: 'Lab automation',
    simulator: 'MuJoCo',
    title: 'Unscrewing a tube cap by feel',
    lead: 'Before anything can be poured, the cap has to come off. One UR5e holds the tube steady while the other unscrews the cap a quarter turn at a time, and uses its wrist force sensor, not a turn count, to know when the cap is free.',
    videoAlt: 'One robot arm holds a capped test tube while the other unscrews the cap in quarter turns, with live charts of the twist and pull at its wrist',
    setup: [
      { label: 'Robots', value: 'Two UR5e arms with Robotiq 2F-85 grippers' },
      { label: 'Simulation', value: 'MuJoCo, with a 24-410 screw thread built to the real cap’s pitch and turns' },
      { label: 'Sensing', value: 'Overhead and wrist cameras, wrist force and torque' },
      { label: 'Learned parts', value: 'Optional: the unscrewing itself, learned from touch alone' },
    ],
    challenge: {
      intro: 'A screw cap is one of the most common things in a lab, and one of the hardest for a robot to be sure about.',
      points: [
        {
          title: 'A thread only lets go by turning',
          description: 'Pulling a screw cap straight up does nothing. It has to turn about one and a half times, rising a little with each turn.',
        },
        {
          title: 'Fingers slip',
          description: 'Each quarter turn of the wrist turns the cap a little less than a quarter, so counting turns does not tell you when it is off.',
        },
        {
          title: 'The last turn feels like the others',
          description:
            'Once the seal breaks, every quarter turn takes the same small twist, including the one where the cap comes free. Twist alone cannot tell.',
        },
        {
          title: 'The tube must not spin',
          description: 'Breaking the seal takes far more twist than an ordinary grip on a glass tube can resist, so the holding arm needs a grip built for it.',
        },
      ],
    },
    steps: [
      {
        title: 'Find and lift a capped tube',
        description: 'The overhead camera finds the capped tubes. Arm A picks one from the side and holds it up above the middle of the table.',
      },
      {
        title: 'Lock the grip',
        description: 'Arm A grips tighter, with the tube centred between its finger pads, and locks its fingers.',
      },
      {
        title: 'Grip the cap',
        description: 'Arm B looks down with its wrist camera, comes down over the cap and grips it from above.',
      },
      {
        title: 'Quarter turn, then a lift test',
        description: 'Turn the wrist 90°, then pull up a few millimetres. If the cap pulls back, it is still on: let go, turn back, grip again and repeat.',
      },
      {
        title: 'Cap off, tube to the rack',
        description:
          'When the pull is gone and the arm feels only the cap’s weight, Arm B carries the cap to its holder and Arm A puts the open tube in the rack.',
      },
    ],
    modelCall: {
      question: 'Does unscrewing need a learned model?',
      programmed: [
        'The whole loop, written by hand: turn, lift test, grip again',
        'Picking, holding and putting back the tube',
        'A collision check before every move, including against the other arm',
      ],
      learned: [
        'An ACT policy that unscrews using only what the arm feels: force, torque and joint angles, no camera',
        'Learned by watching the programmed version do the task',
        'Trained with realistic sensor noise, so it never relies on readings a real sensor could not give',
      ],
      howWeChose:
        'We built the programmed loop first, as the baseline and as the teacher. The learned policy copies it using touch alone. It earns its extra cost on harder cases, such as caps screwed on by different amounts, where a fixed loop starts to struggle.',
    },
    decisions: [
      {
        title: '“Off” is felt, not counted',
        description:
          'A lift test after each quarter turn decides. Counting a fixed number of turns fails as soon as the fingers slip or the thread runs a little longer.',
      },
      {
        title: 'A second check before carrying',
        description:
          'Once the pull is gone, Arm B checks it is carrying only the cap’s weight. More would mean the tube is coming up with it, and the run stops safely instead.',
      },
      {
        title: 'A grip built for twist',
        description: 'Arm A holds the tube centred between the pads, squeezes within the real gripper’s force range, and locks, as the real gripper does.',
      },
      {
        title: 'Physics checked against the hardware',
        description:
          'The seal, friction and thread follow published figures for 24 mm caps. A trial with the UR5e and 2F-85 models showed the lift test tells “on” from “off” with room to spare over a real wrist sensor’s error.',
      },
    ],
    tools: ['MuJoCo', 'UR5e', 'Robotiq 2F-85', 'Force/torque sensing', 'ACT', 'PyTorch', 'Python'],
    next: [
      'Caps screwed on by different amounts, where a learned policy can beat the fixed loop',
      'Caps on the full source tubes, opened without spilling',
      'Screwing caps back on to a set torque, as capping machines do',
    ],
    relatedAreas: ['manipulation', 'learning', 'simulation'],
  },
  {
    slug: 'glass-racking',
    name: 'Racking drinking glasses',
    summary: 'One arm measures a glass it has never seen, weighs it, turns it over and stands it on a drying rack.',
    sector: 'Glassware handling',
    simulator: 'Gazebo',
    title: 'Racking a glass it has never seen before',
    lead: 'Glasses come in endless proportions, so a table of sizes would never be complete. This UR5e measures each glass with its wrist camera, decides where to hold it from the shape alone, weighs it, turns it upside down and lowers it onto a drying-rack peg until it feels the rack take the weight.',
    videoAlt: 'A robot arm finds a drying rack, measures a glass from the side, picks it up, weighs it, turns it over and lowers it onto a peg',
    setup: [
      { label: 'Robot', value: 'One UR5e with a two-finger parallel gripper' },
      { label: 'Simulation and software', value: 'Gazebo Harmonic, ROS 2 Jazzy and MoveIt 2' },
      { label: 'Sensing', value: 'Wrist depth camera and wrist force sensor' },
      { label: 'Learned parts', value: 'None: every step is programmed' },
    ],
    challenge: {
      intro: 'Glassware is fragile, varied and awkward to hold, which is why it is still racked by hand in most kitchens and labs.',
      points: [
        {
          title: 'Shapes are known, sizes are not',
          description: 'The arm knows what a tumbler or a wine glass is, but not how tall this one is. Glasses from different sets never share proportions.',
        },
        {
          title: 'Weight cannot be seen',
          description: 'How hard to grip depends on a weight the camera cannot measure.',
        },
        {
          title: 'Often one safe place to hold',
          description: 'A glass can only be held in some places, and the grip has to leave the rim free for the rack.',
        },
        {
          title: 'The set-down has to be felt',
          description: 'Lowered upside down onto a peg, the glass must be let go only once the rack is carrying it.',
        },
      ],
    },
    steps: [
      { title: 'Find the drying rack', description: 'The wrist camera reads a marker on the rack’s base to find where it stands.' },
      { title: 'Survey the table', description: 'Pictures from above find each glass and the width of its footprint.' },
      {
        title: 'Measure the glass from the side',
        description: 'One side-on picture gives the glass’s full profile: a width at every height, in millimetres. Nothing about it is known in advance.',
      },
      {
        title: 'Recognise the shape, choose the grip',
        description: 'Simple tests on the profile say what kind of glass it is, and one rule per kind says where to hold it.',
      },
      { title: 'Pick it up and weigh it', description: 'The wrist force sensor weighs the glass, and the grip is set from that weight.' },
      { title: 'Turn it upside down', description: 'The arm leans the glass 20° first and checks the fingers are not slipping, then turns it over.' },
      { title: 'Lower it onto a peg', description: 'The arm lowers the glass until it touches, and lets go only once the rack is carrying the weight.' },
    ],
    modelCall: {
      question: 'Does this task need a learned model at all?',
      programmed: [
        'Finding glasses from depth pictures of the table',
        'Measuring the profile and naming the kind from it',
        'Grip, weigh, turn and set-down, each checked by touch',
      ],
      learned: [
        'Not needed for one glass on a clear table',
        'Learned segmentation and grasping come in when glasses crowd together or several kinds share a table, the next stages of this project',
      ],
      howWeChose:
        'A drinking glass is round: its outline from the side is its whole shape. That makes the measurement exact and the rules short, so a trained classifier would add risk without adding anything. A new kind of glass means writing one rule, not collecting data.',
    },
    decisions: [
      {
        title: 'No table of sizes anywhere',
        description: 'The arm holds rules about shapes and measures the size a second before it needs it, so a new glass needs no new data.',
      },
      {
        title: 'Measure with geometry, not depth',
        description:
          'Pixels become millimetres because the arm chose how far from the glass to stand. That part works on clear glass too, which depth cameras struggle to see.',
      },
      {
        title: 'Check before committing',
        description: 'A small tilt before the full turn shows whether the fingers are slipping, while the glass is still low and safe.',
      },
      {
        title: 'Built on the standard ROS stack',
        description: 'ROS 2 and MoveIt 2 plan every motion, the same software a real UR5e cell runs on.',
      },
    ],
    tools: ['Gazebo Harmonic', 'ROS 2 Jazzy', 'MoveIt 2', 'UR5e', 'Depth camera', 'Force/torque sensing', 'Python'],
    next: [
      'Stemmed and tapered glasses, which need a different hold',
      'Several glasses at once, including ones standing too close to grip',
      'Mixed kinds on one table, and glasses whose proportions are written down nowhere',
    ],
    relatedAreas: ['perception', 'manipulation', 'integration'],
  },
];

/** Public path of a use case's media file. */
export function mediaForUseCase(slug: string, file: 'demo.mp4' | 'demo-poster.jpg' | 'card.jpg'): string {
  return `/robotics/use-cases/${slug}/${file}`;
}

export function getUseCase(slug: string): UseCase | undefined {
  return useCases.find((useCase) => useCase.slug === slug);
}
