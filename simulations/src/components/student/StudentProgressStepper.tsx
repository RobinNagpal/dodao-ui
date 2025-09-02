import { Check, Clock, Target, PlayCircle, ExternalLink, BookOpen, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

export interface ExerciseProgress {
  id: string;
  title: string;
  orderNumber: number;
  isCompleted: boolean;
  isAttempted: boolean;
  isCurrent: boolean;
  attemptCount: number;
}

export interface ModuleProgress {
  id: string;
  title: string;
  orderNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  exercises: ExerciseProgress[];
}

export interface ProgressData {
  caseStudyTitle: string;
  caseStudyId: string;
  currentModuleId: string;
  currentExerciseId: string;
  modules: ModuleProgress[];
}

export interface StudentProgressStepperProps {
  progressData: ProgressData;
}

interface PromptEngineeringVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration?: string;
}

// Prompt Engineering Guide videos - Add your YouTube playlist here
const promptEngineeringVideos: PromptEngineeringVideo[] = [
  {
    id: '1',
    title: 'Introduction to Prompt Engineering',
    url: 'https://www.youtube.com/watch?v=LxGh5BJtv-4',
    thumbnail: 'https://img.youtube.com/vi/LxGh5BJtv-4/mqdefault.jpg',
    duration: '1:10',
  },
  {
    id: '2',
    title: 'Core Components of a Prompt',
    url: 'https://www.youtube.com/watch?v=tHwrAubRhfY',
    thumbnail: 'https://img.youtube.com/vi/tHwrAubRhfY/mqdefault.jpg',
    duration: '2:15',
  },
  {
    id: '3',
    title: 'Understanding AI Interaction Roles: System, User, and Assistant',
    url: 'https://www.youtube.com/watch?v=VtHEUmnYnnE',
    thumbnail: 'https://img.youtube.com/vi/VtHEUmnYnnE/mqdefault.jpg',
    duration: '1:43',
  },
  {
    id: '4',
    title: 'Foundational Rules for Crafting Prompts',
    url: 'https://www.youtube.com/watch?v=lEiGgeIf0TM',
    thumbnail: 'https://img.youtube.com/vi/lEiGgeIf0TM/mqdefault.jpg',
    duration: '2:12',
  },
  {
    id: '5',
    title: 'How to Structure a Great AI Prompt',
    url: 'https://www.youtube.com/watch?v=4Dt_NsLNdBk',
    thumbnail: 'https://img.youtube.com/vi/4Dt_NsLNdBk/mqdefault.jpg',
    duration: '1:59',
  },
  {
    id: '6',
    title: 'Zero Shot Prompting Explained',
    url: 'https://www.youtube.com/watch?v=hwN3ndlCFFo',
    thumbnail: 'https://img.youtube.com/vi/hwN3ndlCFFo/mqdefault.jpg',
    duration: '1:38',
  },
  {
    id: '7',
    title: 'One-Shot Prompting Explained',
    url: 'https://www.youtube.com/watch?v=w98mjeecd_4',
    thumbnail: 'https://img.youtube.com/vi/w98mjeecd_4/mqdefault.jpg',
    duration: '2:19',
  },
  {
    id: '8',
    title: 'Few-Shot Prompting Explained',
    url: 'https://www.youtube.com/watch?v=nDC36Xh7sTk',
    thumbnail: 'https://img.youtube.com/vi/nDC36Xh7sTk/mqdefault.jpg',
    duration: '0:51',
  },
  {
    id: '9',
    title: 'Prompt Chaining Explained',
    url: 'https://www.youtube.com/watch?v=DWr4oa9zQ1Y',
    thumbnail: 'https://img.youtube.com/vi/DWr4oa9zQ1Y/mqdefault.jpg',
    duration: '4:25',
  },
  {
    id: '10',
    title: 'Chain-of-Thought Prompting Explained',
    url: 'https://www.youtube.com/watch?v=HuxpzSdH6Vs',
    thumbnail: 'https://img.youtube.com/vi/HuxpzSdH6Vs/mqdefault.jpg',
    duration: '3:23',
  },
  {
    id: '11',
    title: 'Meta Prompting Explained',
    url: 'https://www.youtube.com/watch?v=Oqk1mWglswM',
    thumbnail: 'https://img.youtube.com/vi/Oqk1mWglswM/mqdefault.jpg',
    duration: '3:30',
  },
  {
    id: '12',
    title: 'Active Prompting Explained',
    url: 'https://www.youtube.com/watch?v=ag-KMqLUMcI',
    thumbnail: 'https://img.youtube.com/vi/ag-KMqLUMcI/mqdefault.jpg',
    duration: '3:38',
  },
  {
    id: '13',
    title: 'Tree-of-Thought Prompting Explained',
    url: 'https://www.youtube.com/watch?v=GwgH0hdNNqI',
    thumbnail: 'https://img.youtube.com/vi/GwgH0hdNNqI/mqdefault.jpg',
    duration: '6:20',
  },
  {
    id: '14',
    title: 'Self-Consistency Prompting Explained',
    url: 'https://www.youtube.com/watch?v=K5qBVfEO530',
    thumbnail: 'https://img.youtube.com/vi/K5qBVfEO530/mqdefault.jpg',
    duration: '5:03',
  },
  {
    id: '15',
    title: 'Multi-Perspective Simulation (MPS) Explained',
    url: 'https://www.youtube.com/watch?v=5I6CswSzUS8',
    thumbnail: 'https://img.youtube.com/vi/5I6CswSzUS8/mqdefault.jpg',
    duration: '4:01',
  },
  {
    id: '16',
    title: 'Comparative Prompting Explained',
    url: 'https://www.youtube.com/watch?v=pvAxNZgznG8',
    thumbnail: 'https://img.youtube.com/vi/pvAxNZgznG8/mqdefault.jpg',
    duration: '2:57',
  },
  {
    id: '17',
    title: 'Guided Exploration Prompting Explained',
    url: 'https://www.youtube.com/watch?v=umI3x2PcGrw',
    thumbnail: 'https://img.youtube.com/vi/umI3x2PcGrw/mqdefault.jpg',
    duration: '3:37',
  },
  {
    id: '18',
    title: 'Iterative Refinement Loop Prompting Explained',
    url: 'https://www.youtube.com/watch?v=K5etSvSXhsQ',
    thumbnail: 'https://img.youtube.com/vi/K5etSvSXhsQ/mqdefault.jpg',
    duration: '4:20',
  },
  {
    id: '19',
    title: 'Prompt Compression Explained',
    url: 'https://www.youtube.com/watch?v=-0F6II7aT3w',
    thumbnail: 'https://img.youtube.com/vi/-0F6II7aT3w/mqdefault.jpg',
    duration: '1:38',
  },
  {
    id: '20',
    title: 'Revision-by-Criteria Prompting Explained',
    url: 'https://www.youtube.com/watch?v=DlxUHXgeg4Q',
    thumbnail: 'https://img.youtube.com/vi/DlxUHXgeg4Q/mqdefault.jpg',
    duration: '2:57',
  },
  {
    id: '21',
    title: 'Self-Critique / Verification Prompting',
    url: 'https://www.youtube.com/watch?v=9BoP3wQxong',
    thumbnail: 'https://img.youtube.com/vi/9BoP3wQxong/mqdefault.jpg',
    duration: '2:25',
  },
  {
    id: '22',
    title: 'Adding a Human Touch Prompting Explained',
    url: 'https://www.youtube.com/watch?v=NFYzCwCsBbU',
    thumbnail: 'https://img.youtube.com/vi/NFYzCwCsBbU/mqdefault.jpg',
    duration: '2:37',
  },
];

export default function StudentProgressStepper({ progressData }: StudentProgressStepperProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'learning-path' | 'prompt-engineering'>('learning-path');

  const handleExerciseClick = (exercise: ExerciseProgress, moduleId: string) => {
    if (exercise.isCompleted) {
      router.push(`/student/exercise/${exercise.id}?moduleId=${moduleId}&caseStudyId=${progressData.caseStudyId}`);
    }
  };

  const handleVideoClick = (video: PromptEngineeringVideo) => {
    window.open(video.url, '_blank');
  };

  const renderLearningPath = () => (
    <div className="space-y-6">
      {progressData.modules.map((module) => (
        <div key={module.id} className="relative">
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300
                ${
                  module.isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : module.isCurrent
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }
              `}
            >
              {module.isCompleted ? <Check className="h-5 w-5" /> : module.orderNumber}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${module.isCompleted ? 'text-green-700' : module.isCurrent ? 'text-blue-700' : 'text-gray-600'}`}>
                Module {module.orderNumber}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2">{module.title}</p>
            </div>
          </div>

          {/* Exercises List */}
          <div className="ml-4 space-y-2 relative">
            {module.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className={`flex items-start space-x-3 py-1 relative z-10 ${
                  exercise.isCompleted ? 'cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200' : ''
                }`}
                onClick={() => handleExerciseClick(exercise, module.id)}
              >
                <div
                  className={`
                    w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300
                    ${
                      exercise.isCurrent
                        ? 'bg-blue-500 border-blue-500 ring-2 ring-blue-200'
                        : exercise.isCompleted
                        ? 'bg-green-500 border-green-500'
                        : exercise.isAttempted
                        ? 'bg-yellow-500 border-yellow-500'
                        : 'border-gray-300 bg-white'
                    }
                  `}
                >
                  {exercise.isCompleted && <Check className="h-3 w-3 text-white" />}
                  {exercise.isAttempted && !exercise.isCompleted && <Clock className="h-2 w-2 text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium ${
                      exercise.isCurrent
                        ? 'text-blue-600'
                        : exercise.isCompleted
                        ? 'text-green-600 hover:text-green-700'
                        : exercise.isAttempted
                        ? 'text-yellow-600'
                        : 'text-gray-500'
                    } ${exercise.isCompleted ? 'hover:underline' : ''}`}
                  >
                    {exercise.orderNumber}. {exercise.title}
                  </p>
                  {exercise.attemptCount > 0 && <p className="text-xs text-gray-400">{exercise.attemptCount}/3 attempts</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPromptEngineering = () => (
    <div className="space-y-2">
      {promptEngineeringVideos.map((video, index) => (
        <div
          key={video.id}
          className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 group border border-gray-100 hover:border-gray-200"
          onClick={() => handleVideoClick(video)}
        >
          {/* Video Thumbnail - First Row */}
          <div className="relative mb-2">
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={320}
              height={180}
              className="w-full h-[120px]
 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow duration-200"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <PlayCircle className="h-8 w-8 text-white" />
            </div>
            {video.duration && <span className="absolute bottom-1 right-1 bg-black/70 text-white px-1 rounded text-[10px]">{video.duration}</span>}
          </div>

          {/* Video Info - Second Row */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-4">
                {index + 1}. {video.title}
              </p>
            </div>
            <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 ml-2 flex-shrink-0 mt-0.5" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 sticky top-8 ${
        activeTab === 'prompt-engineering' ? 'flex flex-col max-h-[calc(100vh-4rem)]' : ''
      }`}
    >
      {/* Header with Tabs */}
      <div className="p-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('learning-path')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'learning-path'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Learning Path</span>
          </button>
          <button
            onClick={() => setActiveTab('prompt-engineering')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'prompt-engineering'
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <Video className="h-4 w-4" />
            <span>Prompt Engineering</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`${activeTab === 'learning-path' ? 'p-6' : 'p-2'} ${activeTab === 'prompt-engineering' ? 'flex-1 overflow-y-auto' : ''}`}>
        {activeTab === 'learning-path' ? renderLearningPath() : renderPromptEngineering()}
      </div>
    </div>
  );
}
