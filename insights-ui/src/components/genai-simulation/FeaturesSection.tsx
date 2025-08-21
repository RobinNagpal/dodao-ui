import { EyeIcon, WrenchIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function FeaturesSection() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold text-indigo-400">Features for Students & Professors</h2>
          <p className="mt-4 text-lg text-gray-300">Specialized tools for both students and professors to enhance the learning experience.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: 'For Students',
              desc: 'Learn by applying business concepts to realistic case scenarios across finance, HR, marketing, and other domains.',
              icon: EyeIcon,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              title: 'Step-by-Step Learning',
              desc: 'Work through guided exercises that build skills gradually while strengthening prompt-writing abilities.',
              icon: ShieldCheckIcon,
              color: 'from-indigo-500 to-purple-500',
            },
            {
              title: 'For Professors',
              desc: 'Use pre-built case studies, track student work including prompts and responses, and provide quick feedback.',
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
