import { EyeIcon, WrenchIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function FeaturesSection() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold text-white">Powerful Features for Modern Education</h2>
          <p className="mt-4 text-lg text-gray-300">Tools that help you design, run, and evaluate immersive AI-powered learning simulations.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: 'Live Progress Monitoring',
              desc: 'Track student activity in real-time — see their prompts, responses, and areas that need guidance.',
              icon: EyeIcon,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              title: 'AI-Assisted Evaluation',
              desc: 'Speed up grading with AI-generated assessments for completeness and depth, while keeping full instructor control.',
              icon: ShieldCheckIcon,
              color: 'from-indigo-500 to-purple-500',
            },
            {
              title: 'Custom Case Studies',
              desc: 'Use our ready-made library or create your own scenarios tailored to your course objectives.',
              icon: WrenchIcon,
              color: 'from-purple-500 to-pink-500',
            },
          ].map((feature) => (
            <div key={feature.title} className="group relative">
              <div
                className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl"
                style={{
                  background: `linear-gradient(to right, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})`,
                }}
              />
              <div className="relative rounded-2xl border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm hover:border-gray-600 transition-all duration-300 transform hover:scale-105 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
