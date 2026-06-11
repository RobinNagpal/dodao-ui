type Method = {
  num: string;
  title: string;
  what: string;
  best: string;
};

const methods: Method[] = [
  {
    num: '01',
    title: 'Domain Randomization',
    what: 'Vary lighting, textures, camera pose, object pose, and background distractors on every rendered frame so the model does not overfit to "what sim looks like".',
    best: 'NVIDIA Isaac Sim with Replicator',
  },
  {
    num: '02',
    title: 'Procedural Scene Generation',
    what: 'Code generates the whole scene every time. Random objects on random shelves with random clutter, instead of one hand-built world rendered many ways.',
    best: 'NVIDIA Replicator, Google Kubric',
  },
  {
    num: '03',
    title: 'Photo-Real Rendering',
    what: 'Ray-traced images with physically based materials. The output looks close to a real photograph, which matters when a sim-trained vision model has to run on a real camera.',
    best: 'Isaac Sim (RTX), Unreal Engine 5',
  },
  {
    num: '04',
    title: 'Reinforcement-Learning Envs',
    what: 'Wrap the simulator as a Gym/Gymnasium env with a reward function. Data is rollouts generated during training, not in advance.',
    best: 'Isaac Lab (GPU-parallel), MuJoCo (contact-rich), Drake',
  },
  {
    num: '05',
    title: 'Imitation-Learning Demos',
    what: 'Log (observation, action) per timestep while a scripted or teleop expert does the task. Hundreds of demos become training data for Behaviour Cloning, Diffusion Policy or ACT.',
    best: 'Robomimic, LeRobot, RLDS on top of Isaac Lab / MuJoCo / Robosuite',
  },
  {
    num: '06',
    title: 'Sensor Noise Modelling',
    what: 'Add realistic noise to the perfect sensor reading. RealSense has speckle, Kinect has dropout, F/T sensors drift.',
    best: 'Isaac Sim ships RealSense, Kinect, ZED and Velodyne noise models',
  },
  {
    num: '07',
    title: 'Scenario / Failure Authoring',
    what: 'A YAML or Python config that says "perturb the scene this way, run the expert, label the outcome." Used to build safety / edge-case datasets.',
    best: 'CARLA scenario runner, NVIDIA DRIVE Sim, Isaac Lab',
  },
  {
    num: '08',
    title: 'Synthetic OCR / Barcodes',
    what: 'Pictures of vials, boxes or screens with generated text or codes baked on, used to test OCR and barcode pipelines at random fonts, glare and angles.',
    best: 'Isaac Sim Replicator (built-in text randomizer), Blender + Pillow',
  },
];

export default function IndustryMethodsSection() {
  return (
<<<<<<< HEAD
    <section id="industry-methods" className="relative py-20 bg-gradient-to-b from-gray-900 to-gray-800 scroll-mt-24">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-400">The Landscape</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">How industry produces synthetic data today</p>
          <p className="mt-4 text-lg text-gray-300">
=======
    <section id="industry-methods" className="relative py-20 bg-gradient-to-b from-bg to-surface scroll-mt-24">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">The Landscape</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">How industry produces synthetic data today</p>
          <p className="mt-4 text-lg text-body">
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
            These are the main techniques teams use in 2026. We pick the right method and the right simulator for your project, not a fixed stack.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {methods.map((m) => (
<<<<<<< HEAD
            <article key={m.num} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-white/20 transition-colors">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm font-semibold text-blue-300">{m.num}</span>
                <h3 className="text-lg font-semibold text-white">{m.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-300">{m.what}</p>
              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">Best with</span>
                  <span className="text-sm text-gray-200">{m.best}</span>
                </div>
                {/* <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">Used by</span>
                  <span className="text-sm text-gray-300">{m.usedBy}</span>
=======
            <article key={m.num} className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-6 hover:border-primary/40 transition-colors">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm font-semibold text-primary">{m.num}</span>
                <h3 className="text-lg font-semibold text-heading">{m.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-body">{m.what}</p>
              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">Best with</span>
                  <span className="text-sm text-body">{m.best}</span>
                </div>
                {/* <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">Used by</span>
                  <span className="text-sm text-body">{m.usedBy}</span>
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
                </div> */}
              </div>
            </article>
          ))}
        </div>

<<<<<<< HEAD
        <div className="mt-12 mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
          <p className="text-sm leading-6 text-gray-300">
            Most of the methods above also exist in <span className="font-semibold text-white">Gazebo</span> at a lower fidelity. When the task is geometric
            (pick-and-place, known fixtures) and you need MoveIt 2 or Nav2 to work out of the box, Gazebo is the right tool. When you need photo-realistic RGB,
            massive parallel RL or contact-rich force data, the right answer in most categories is{' '}
            <span className="font-semibold text-blue-300">NVIDIA Isaac Sim</span>. We pick per project.
=======
        <div className="mt-12 mx-auto max-w-3xl rounded-2xl border border-border bg-surface/60 p-6 text-center backdrop-blur-sm">
          <p className="text-sm leading-6 text-body">
            Most of the methods above also exist in <span className="font-semibold text-heading">Gazebo</span> at a lower fidelity. When the task is geometric
            (pick-and-place, known fixtures) and you need MoveIt 2 or Nav2 to work out of the box, Gazebo is the right tool. When you need photo-realistic RGB,
            massive parallel RL or contact-rich force data, the right answer in most categories is{' '}
            <span className="font-semibold text-primary">NVIDIA Isaac Sim</span>. We pick per project.
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
          </p>
        </div>
      </div>
    </section>
  );
}
