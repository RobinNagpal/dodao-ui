'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ClipboardDocumentListIcon, CogIcon, EyeIcon, ChatBubbleLeftRightIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const steps = [
    {
      step: '01',
      title: 'Gen AI Prompt Engineering Course',
      desc: 'Instructors can ask students to complete this course to learn the most important concepts for writing effective prompts and understanding AI Agents.',
      icon: ClipboardDocumentListIcon,
      color: 'from-blue-500 to-cyan-500',
      detail: 'Takes 1.5-2 hours to complete and provides essential foundation for the simulation platform.',
    },
    {
      step: '02',
      title: 'Practical Video Lessons',
      desc: 'Short, practical videos teach techniques like breaking down complex tasks into smaller, manageable steps.',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-indigo-500 to-blue-500',
      detail: 'Students learn to apply prompt engineering directly to real business topics.',
    },
    {
      step: '03',
      title: 'KoalaGains Simulation Platform',
      desc: 'Instructors select predefined real-world scenarios for their classes, helping students use Gen AI for research and insights.',
      icon: CogIcon,
      color: 'from-purple-500 to-indigo-500',
      detail: 'Students learn key business concepts while applying Gen AI skills to solve real problems.',
    },
    {
      step: '04',
      title: 'Scenario-Based Learning',
      desc: 'Each scenario is divided into modules that progress from basic to advanced concepts, with students completing one before moving to the next.',
      icon: EyeIcon,
      color: 'from-pink-500 to-purple-500',
      detail: 'Students build background knowledge needed to understand concepts and solve problems.',
    },
    {
      step: '05',
      title: 'AI-Powered Exercises',
      desc: 'Every module contains exercises that students solve using Gen AI, applying their prompt engineering skills to perform analysis.',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-rose-500 to-pink-500',
      detail: 'Students get three chances to refine their prompts and responses for optimal results.',
    },
    {
      step: '06',
      title: 'Instructor Oversight',
      desc: 'Instructors can view both final results and the full history of prompts used by each student.',
      icon: DocumentCheckIcon,
      color: 'from-orange-500 to-rose-500',
      detail: 'Platform allows students to practice real case analysis in a classroom-like environment with instructor guidance.',
    },
  ];

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section id="how-it-works" className="relative py-20" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800" />

      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          backgroundPosition: ['0px 0px', '40px 40px'],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'linear',
        }}
        style={{
          backgroundImage: `linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-indigo-400">Our Two-Part Offering</h2>
          <p className="mt-4 text-lg text-gray-300">
            A complete learning experience with a Gen AI Prompt Engineering Course and the KoalaGains Simulation Platform
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/30 to-purple-500/30">
            <motion.div className="w-full bg-gradient-to-b from-indigo-500 to-purple-500" style={{ height: lineHeight }} />
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <StepItem key={step.step} step={step} index={index} />
            ))}
          </div>

          <CompletionIndicator scrollProgress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}

function StepItem({ step, index }: { step: any; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-20%' });

  return (
    <motion.div
      ref={ref}
      className="relative flex items-start gap-8"
      initial={{ opacity: 0, x: 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0.4, x: 20 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Step indicator */}
      <div className="relative flex-shrink-0">
        <motion.div
          className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
          animate={isInView ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {step.step}
        </motion.div>
        {isInView && (
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.color} opacity-30`}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
      </div>

      {/* Content */}
      <motion.div
        className={`flex-1 rounded-2xl border backdrop-blur-sm p-6 transition-all duration-500 ${
          isInView ? 'border-gray-600 bg-gray-800/50' : 'border-gray-700 bg-gray-800/30'
        }`}
        whileHover={{ scale: 1.02, borderColor: 'rgb(99 102 241)' }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start gap-4">
          <motion.div
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${step.color} flex-shrink-0`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <step.icon className="h-5 w-5 text-white" />
          </motion.div>
          <div className="flex-1">
            <h3 className={`text-xl font-semibold mb-2 transition-colors ${isInView ? 'text-white' : 'text-gray-400'}`}>{step.title}</h3>
            <p className={`leading-relaxed mb-3 transition-colors ${isInView ? 'text-gray-300' : 'text-gray-500'}`}>{step.desc}</p>
            <div className={`text-sm font-medium transition-colors ${isInView ? 'text-indigo-300' : 'text-gray-600'}`}>{step.detail}</div>
          </div>
        </div>

        {/* Progress indicator */}
        {isInView && (
          <motion.div
            className={`mt-4 h-1 bg-gradient-to-r ${step.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

function CompletionIndicator({ scrollProgress }: { scrollProgress: any }) {
  const isComplete = useTransform(scrollProgress, [0.8, 1], [0, 1]);
  const [label, setLabel] = useState('Scroll to see the complete workflow');

  useEffect(() => {
    const unsubscribe = isComplete.on('change', (latest) => {
      setLabel(latest > 0.5 ? 'Workflow Complete - Students Ready for Industry!' : 'Scroll to see the complete workflow');
    });
    return () => unsubscribe();
  }, [isComplete]);

  return (
    <motion.div className="mt-12 text-center">
      <motion.div
        className="inline-flex border items-center gap-3 rounded-full px-6 py-3 backdrop-blur-sm transition-all duration-500"
        style={{
          backgroundColor: useTransform(isComplete, [0, 1], ['rgba(31, 41, 55, 0.5)', 'rgba(34, 197, 94, 0.2)']),
          borderColor: useTransform(isComplete, [0, 1], ['rgb(55, 65, 81)', 'rgba(34, 197, 94, 0.3)']),
          color: useTransform(isComplete, [0, 1], ['rgb(156, 163, 175)', 'rgb(134, 239, 172)']),
        }}
      >
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: useTransform(isComplete, [0, 1], ['rgb(107, 114, 128)', 'rgb(74, 222, 128)']),
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.span
          className="text-sm font-medium"
          style={{
            opacity: useTransform(isComplete, [0, 1], [0.7, 1]),
          }}
        >
          {label}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
