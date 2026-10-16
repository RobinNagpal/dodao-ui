/**
 * Content for the five robotics capability areas on dodao.io.
 *
 * Used by the homepage "What we build" cards and by the area pages at
 * `/robotics/[area]`. Facts and figures come from our notes on
 * docs.dodao.io (read September 2026); each `source` points at the page.
 */

export type AreaMedia =
  | { kind: 'video'; src: string; poster?: string; alt: string }
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'pair'; items: { src: string; alt: string; label: string }[] };

export type Capability = {
  name: string;
  description: string;
  details: string[];
};

export type Fact = {
  value: string;
  label: string;
};

export type ComparisonTable = {
  title: string;
  intro: string;
  columns: string[];
  rows: string[][];
  note?: string;
};

export type RoboticsArea = {
  slug: string;
  /** Short name used on cards and in menus. */
  name: string;
  /** One-line summary for cards and menus. */
  summary: string;
  title: string;
  lead: string;
  heroMedia: AreaMedia;
  /** Still image for the homepage card. */
  cardImage: string;
  capabilities: Capability[];
  facts: Fact[];
  table: ComparisonTable;
  modelCall: { question: string; programmed: string[]; learned: string[]; howWeChoose: string };
  tools: string[];
  deliverables: string[];
  docLinks: { title: string; href: string }[];
};

export const roboticsAreas: RoboticsArea[] = [
  {
    slug: 'simulation',
    name: 'Simulation & synthetic data',
    summary: 'Gazebo, MuJoCo and Isaac Sim worlds that produce training data and run every test before hardware.',
    title: 'Build the cell in software first',
    lead: 'We model your robot, parts, cameras and cell in the simulator that suits the job. The same world then produces labeled training data and runs the tests every model has to pass before it touches hardware.',
    heroMedia: {
      kind: 'video',
      src: '/robotics/robotics_video_2.mp4',
      alt: 'The same dual-arm motion running in simulation and on the real robot cell, side by side',
    },
    cardImage: '/robotics/robotics_sim.jpg',
    capabilities: [
      {
        name: 'Simulation setup and worlds',
        description: 'Your robot, cell, parts and sensors modeled to match reality.',
        details: [
          'Gazebo, MuJoCo, NVIDIA Isaac Sim and Isaac Lab',
          'Robot models from URDF, MJCF or USD',
          'Cameras, depth and force sensors that match real hardware',
          'Friction and contact tuned against measurements from the real cell',
        ],
      },
      {
        name: 'Synthetic data and model evaluation',
        description: 'Labeled data and repeatable test scenes from the same simulation.',
        details: [
          'Randomized lighting, textures, poses and clutter',
          'Labels for detection, segmentation, pose and grasps',
          'Benchmark scenes with success-rate reports',
          'Sim-to-real checks against real camera images',
        ],
      },
    ],
    facts: [
      { value: '8 min vs 199 h', label: 'The same 239,361 learning actions in a simple simulated world, against a real arm at 3 seconds an action.' },
      { value: '650,000', label: 'MuJoCo physics steps per second for a humanoid on a laptop processor. Not every job needs a data-center GPU.' },
      { value: '16 GB', label: 'Minimum video memory for Isaac Sim, on an RTX-class card. It does not run on macOS, which shapes the toolchain.' },
    ],
    table: {
      title: 'Choosing a simulator',
      intro: 'No simulator is best at everything. We pick per project, and sometimes use two.',
      columns: ['Simulator', 'Best at', 'Watch out for'],
      rows: [
        ['Gazebo (Jetty LTS)', 'ROS 2 integration, camera work; supported to 2031', 'Slow for large-scale data generation and learning'],
        ['MuJoCo', 'Fast, accurate contact; runs well on a laptop', 'Photoreal rendering is limited'],
        ['NVIDIA Isaac Sim / Isaac Lab', 'Photoreal rendering and massively parallel RL on GPU', 'Needs an RTX GPU; parts of the stack are closed'],
      ],
    },
    modelCall: {
      question: 'Can the simulation be trusted for this decision?',
      programmed: ['Hand-built scenes with measured friction and masses', 'Fixed test layouts scored the same way every run'],
      learned: ['Learned dynamics or world models trained on simulated pushes', 'Generated scene variations for data and evaluation'],
      howWeChoose:
        'Appearance and geometry transfer well. Contact does not yet: no published work claims to have closed that gap. So we use simulation to choose and rank approaches, then always confirm on hardware.',
    },
    tools: ['Gazebo', 'MuJoCo', 'Isaac Sim', 'Isaac Lab', 'ManiSkill 3', 'Genesis', 'NVIDIA Replicator', 'URDF / MJCF / USD'],
    deliverables: ['A simulated cell you can run yourself', 'Randomization configs and labeled datasets', 'An evaluation harness with success-rate reports'],
    docLinks: [{ title: 'Simulation and evaluation', href: 'https://docs.dodao.io/frameworks/frontier/simulation-and-evaluation/' }],
  },
  {
    slug: 'perception',
    name: 'Perception & vision',
    summary: 'Cameras, calibration and models that find parts and their poses, even in clutter.',
    title: 'Give the robot a reliable picture of the cell',
    lead: 'Cameras, calibration and models that tell the arm where each part is and which way it faces: in clutter, under changing light, and on parts that shine or are see-through.',
    heroMedia: {
      kind: 'video',
      src: '/robotics/robotics_video_1.mp4',
      alt: 'Grid of rendered images of a container, each with different lighting, colors and background, used to train a detector',
    },
    cardImage: '/robotics/clips/lab-vials.jpg',
    capabilities: [
      {
        name: 'Robot perception and vision',
        description: 'From choosing the camera to the model that reads it.',
        details: [
          'Depth cameras chosen on measured accuracy',
          'Hand-eye calibration',
          'Detection and segmentation with RF-DETR, YOLO and SAM 2',
          '6-DoF pose estimation for known and new objects',
          'Point clouds for bins, shelves and trays',
          'Transparent and reflective parts',
        ],
      },
    ],
    facts: [
      { value: '±0.2 mm', label: 'Published accuracy of a Zivid 2+ structured-light camera at 1 m. A wrist RealSense D405 is ±2% at 50 cm.' },
      { value: 'AGPL-3.0', label: 'The licence of Ultralytics YOLO. For client products we default to permissive detectors such as RF-DETR.' },
      { value: 'Non-commercial', label: 'The licence of FoundationPose. When you intend to ship, we use BSD-licensed HappyPose / MegaPose instead.' },
    ],
    table: {
      title: 'Choosing a depth camera',
      intro: 'Published accuracy, read from each maker’s datasheet. The right camera depends on distance, parts and budget.',
      columns: ['Camera', 'How it works', 'Published accuracy'],
      rows: [
        ['Intel RealSense D405', 'Passive stereo, close range', '±2% at 50 cm; good on the wrist'],
        ['Intel RealSense D435i', 'Active stereo, general purpose', 'RMS about 2 mm at 1 m'],
        ['Orbbec Gemini 335L', 'Active stereo', '0.8% at 2 m'],
        ['Zivid 2+', 'Structured light', '±0.2 mm at 1 m'],
        ['Photoneo PhoXi L', 'Structured light', '0.524 mm point to point'],
      ],
    },
    modelCall: {
      question: 'Where is the part, and which way is it facing?',
      programmed: ['Fixed camera poses and fiducial markers (AprilTag, ArUco)', 'Color and depth thresholds', 'Template matching against CAD models'],
      learned: ['Detection and segmentation models (RF-DETR, YOLO, SAM 2)', '6-DoF pose estimation', 'Trained on synthetic images plus a small real set'],
      howWeChoose:
        'If parts, fixtures and lighting are controlled, classical vision is cheaper and easier to certify. With many part types, clutter, or shiny and transparent parts, learned perception usually wins. Borrowed weights rarely work as downloaded, so we fine-tune on your cell and prove it on a held-out test set.',
    },
    tools: ['RF-DETR', 'YOLO', 'SAM 2', 'HappyPose / MegaPose', 'FoundationPose', 'Open3D', 'easy_handeye2', 'RealSense / Zivid / Orbbec'],
    deliverables: ['A camera and lighting plan', 'Calibrated cameras', 'Trained perception models with a held-out test report'],
    docLinks: [{ title: 'Sensors compared', href: 'https://docs.dodao.io/perception/object-perception/sensors/' }],
  },
  {
    slug: 'manipulation',
    name: 'Grasping, motion & multi-arm',
    summary: 'Reliable grasps, collision-free motion and two arms that stay out of each other’s way.',
    title: 'Grasp, move and coordinate on cycle time',
    lead: 'Getting a grip on real parts, moving without collisions, and keeping two arms out of each other’s way, within the speed and force limits a shared workspace needs.',
    heroMedia: {
      kind: 'video',
      src: '/robotics/clips/cluttered-picking.mp4',
      poster: '/robotics/clips/cluttered-picking.jpg',
      alt: 'A robot gripper picking leaves from a cluttered tray',
    },
    cardImage: '/robotics/stock/pick-and-place.jpg',
    capabilities: [
      {
        name: 'Grasping solutions',
        description: 'Reliable grasps on the parts you actually have, including dense and messy bins.',
        details: [
          'Parallel-jaw, suction and multi-finger grippers',
          'Grasp planning in dense, cluttered bins',
          'Pushing and singulation before the grasp',
          'Collision and reachability checks on every grasp',
        ],
      },
      {
        name: 'Motion planning and arm control',
        description: 'Collision-free paths and controllers that handle contact.',
        details: [
          'MoveIt 2 with OMPL and Pilz planners',
          'GPU motion generation with cuRobo',
          'Time-optimal trajectories with Ruckig and TOPP-RA',
          'Force, impedance and compliance control',
        ],
      },
      {
        name: 'Multi-arm movement and coordination',
        description: 'Two or more arms sharing a workspace safely.',
        details: ['Shared-workspace collision avoidance', 'Synchronized trajectories and handovers', 'Bimanual policies for two-handed tasks'],
      },
    ],
    facts: [
      { value: '235 N', label: 'Maximum grip force of a Robotiq 2F-85. Most failures to hold a light part are friction or geometry, not force.' },
      { value: 'LGPL-2.1', label: 'The licence of KDL, MoveIt’s default inverse-kinematics plugin. Almost nobody notices; we check.' },
      { value: 'ISO/TS 15066', label: 'Speed-and-separation and power-and-force limits we design to when people and arms share a space.' },
    ],
    table: {
      title: 'Grasp models and their catches',
      intro: 'A grasp model is trained for a particular gripper, and its licence decides whether you can ship it.',
      columns: ['Model', 'Gripper it assumes', 'Catch'],
      rows: [
        ['Contact-GraspNet', 'Franka hand', 'Re-check grasps for your jaw width'],
        ['GraspGen', 'Gripper given as an input', 'Needs a GPU'],
        ['AnyGrasp', 'Parallel jaw', 'Strong results, but a machine-locked licence key'],
        ['GPD', 'Parallel jaw', 'BSD licence, runs without a GPU, older method'],
      ],
    },
    modelCall: {
      question: 'Where should the gripper close, and how does the arm get there?',
      programmed: ['Grasps precomputed from CAD or simple shapes', 'MoveIt 2 planners and inverse kinematics', 'Trajectory optimization for cycle time'],
      learned: ['Grasp proposals predicted from point clouds', 'Learned grasp-success scoring', 'Policies for contact-rich final motions'],
      howWeChoose:
        'Known parts in known poses get precomputed grasps, and free-space moves stay programmed because they are fast and verifiable. Mixed objects in dense bins get learned grasp proposals, each filtered by collision and reachability checks before the arm moves.',
    },
    tools: ['MoveIt 2', 'OMPL', 'Pilz', 'cuRobo', 'Ruckig', 'TOPP-RA', 'TRAC-IK', 'BehaviorTree.CPP', 'Robotiq / OnRobot grippers'],
    deliverables: ['Gripper and fingertip recommendation', 'Grasp and motion pipeline integrated with your arm', 'Cycle-time and safety report'],
    docLinks: [
      { title: 'Six-DoF grasp models', href: 'https://docs.dodao.io/learned-models/grasp-models/most-used--six-dof-grasps/' },
      { title: 'Two-arm manipulation', href: 'https://docs.dodao.io/frameworks/two-arm-manipulation/two-arm-manipulation/' },
    ],
  },
  {
    slug: 'learning',
    name: 'Learned models & RL',
    summary: 'Imitation learning, VLA fine-tuning and reinforcement learning, measured on your arm.',
    title: 'Teach the robot, then prove it learned',
    lead: 'Imitation learning, vision-language-action models and reinforcement learning, chosen by what fits your hardware and licence, and measured on your arm rather than on someone else’s benchmark.',
    heroMedia: {
      kind: 'pair',
      items: [
        { src: '/robotics/sim_robot.png', alt: 'A UR robot arm picking a can in simulation', label: 'Simulation' },
        { src: '/robotics/real_robot.png', alt: 'The same UR robot arm picking a can on a real table', label: 'Real arm' },
      ],
    },
    cardImage: '/robotics/clips/seedling-gripper.jpg',
    capabilities: [
      {
        name: 'Learned models for arms',
        description: 'Policies trained from demonstrations, and foundation models fine-tuned for your task.',
        details: [
          'Teleoperation and demonstration capture',
          'Imitation learning with ACT and Diffusion Policy',
          'Fine-tuning VLA models such as π0, GR00T, SmolVLA and OpenVLA',
          'LeRobot datasets and training pipelines',
        ],
      },
      {
        name: 'Reinforcement learning and policy training',
        description: 'Policies that improve through practice in simulation, then transfer to the real cell.',
        details: [
          'Reward and curriculum design',
          'Parallel training in Isaac Lab and MuJoCo',
          'Domain randomization for sim-to-real transfer',
          'Human-in-the-loop RL fine-tuning on hardware',
        ],
      },
    ],
    facts: [
      { value: '1% → 44%', label: 'Success in the ACT paper’s own study when the policy predicts chunks of 100 actions instead of one at a time.' },
      { value: '68–99%', label: 'What 18 successes in 20 trials really tells you (95% interval). We run enough trials for a number to mean something.' },
      { value: '0 of them', label: 'Current VLA models that control force. They output positions, so we add the force limits around them.' },
    ],
    table: {
      title: 'Choosing a learned model',
      intro: 'Size, hardware and licence narrow the choice before any training starts.',
      columns: ['Model', 'Size and hardware', 'Licence and notes'],
      rows: [
        ['SmolVLA', '450M parameters; runs on a laptop', 'Apache-2.0 code and weights'],
        ['ACT', 'About 80M parameters; fast to train', 'Strong for bimanual tasks from demonstrations'],
        ['Diffusion Policy', '100 network passes per action chunk', 'Smooth motions, slower to run'],
        ['GR00T N1', 'About 3B; 16 GB to run, 40 GB+ to fine-tune', 'NVIDIA GPU required'],
        ['OpenVLA', '7B; a full fine-tune needs 8 A100s', 'MIT; LoRA fine-tuning is the practical route'],
        ['π0 / π0.5', 'Needs a large NVIDIA GPU', 'Some weights carry restrictive licence terms'],
      ],
    },
    modelCall: {
      question: 'What does the robot do when contact starts?',
      programmed: ['State machines and behavior trees', 'Force and torque thresholds', 'Impedance and compliance control'],
      learned: ['Imitation learning from demonstrations', 'Vision-language-action models', 'Reinforcement learning fine-tuning'],
      howWeChoose:
        'A learned policy always runs inside a programmed safety envelope: workspace limits, force limits and a fallback behavior. We compare its success rate and cycle time against a scripted baseline, on your arm, before recommending it.',
    },
    tools: ['LeRobot', 'ACT', 'Diffusion Policy', 'SmolVLA', 'π0', 'GR00T', 'OpenVLA', 'Isaac Lab', 'Stable-Baselines3', 'PyTorch'],
    deliverables: ['Demonstration datasets', 'Trained and fine-tuned policies', 'An evaluation report with confidence intervals'],
    docLinks: [
      { title: 'Vision-language-action models', href: 'https://docs.dodao.io/learned-models/language-models/most-used--vision-language-action-models/' },
      { title: 'Evaluation and failure', href: 'https://docs.dodao.io/learned-models/making-models-work-on-an-arm/most-used--evaluation-and-failure/' },
    ],
  },
  {
    slug: 'integration',
    name: 'ROS 2 & hardware',
    summary: 'ROS 2 integration with your line, and arms, grippers, cameras and compute chosen with evidence.',
    title: 'Fit the robot into your line and your budget',
    lead: 'The software that ties robot, sensors and plant systems together, and the arm, gripper, cameras and compute chosen with evidence rather than from a catalogue.',
    heroMedia: {
      kind: 'video',
      src: '/robotics/clips/factory-arm.mp4',
      poster: '/robotics/clips/factory-arm.jpg',
      alt: 'An industrial robot arm working in an automated production cell',
    },
    cardImage: '/robotics/stock/industrial-cell.jpg',
    capabilities: [
      {
        name: 'ROS and middleware integration',
        description: 'The software that ties robot, sensors and plant systems together.',
        details: [
          'ROS 2 nodes, drivers and ros2_control',
          'Perception and planning exposed as services',
          'Bridges to PLCs and line controllers',
          'Containerized deployment, logging with rosbag2, and monitoring',
        ],
      },
      {
        name: 'Hardware selection',
        description: 'The right arm, gripper, cameras and compute, chosen with evidence.',
        details: [
          'Arms, grippers and end-effectors',
          'Cameras and lighting',
          'Training GPUs and on-robot compute',
          'Options compared in simulation before purchase',
        ],
      },
    ],
    facts: [
      { value: '33 ms', label: 'The time per command at 30 commands a second. A model that sometimes takes 90 ms will miss it.' },
      { value: 'Up to 101%', label: 'NVIDIA’s July 2026 Jetson price rise. Tutorials quoting older prices are out of date; we budget with current ones.' },
      { value: '$1,999', label: 'A six-axis research arm (AgileX PiPER) today, in a price band that used to be empty.' },
    ],
    table: {
      title: 'Example hardware we compare',
      intro: 'List prices from our notes, September 2026. We compare options in simulation before you buy.',
      columns: ['Item', 'What it is', 'List price'],
      rows: [
        ['AgileX PiPER', '6-axis arm, 1.5 kg payload', '$1,999'],
        ['UFACTORY xArm 6', '6-axis arm', 'About $8,400 to $8,600'],
        ['NVIDIA Jetson Orin Nano Super', 'On-robot compute for small models', '$399'],
        ['NVIDIA Jetson AGX Thor', 'On-robot compute for larger models', '$5,499'],
      ],
      note: 'Prices change often. We re-check them for every project.',
    },
    modelCall: {
      question: 'Where should the model run?',
      programmed: ['Real-time control loops on the robot controller', 'Safety logic in certified hardware and PLCs'],
      learned: ['Perception and policies on a GPU next to the cell', 'Smaller models on Jetson-class compute on the robot'],
      howWeChoose:
        'We set a time budget for every loop first: for example 33 ms per camera frame and 2 ms per tick of a 500 Hz controller. Then we pick the compute that meets it every time, not on average, within your network and power limits.',
    },
    tools: ['ROS 2 Jazzy', 'ros2_control', 'MoveIt 2', 'rosbag2', 'Docker', 'NVIDIA Jetson', 'OPC UA / PLC bridges'],
    deliverables: ['A hardware shortlist with evidence', 'ROS 2 integration with your line', 'Deployment, monitoring and handover documentation'],
    docLinks: [
      { title: 'Licences and platforms', href: 'https://docs.dodao.io/frameworks/arm-movement/licences-and-platforms/' },
      { title: 'Tools and libraries', href: 'https://docs.dodao.io/frameworks/tools-and-libraries/tools-and-libraries/' },
    ],
  },
];

export function getRoboticsArea(slug: string): RoboticsArea | undefined {
  return roboticsAreas.find((area) => area.slug === slug);
}
