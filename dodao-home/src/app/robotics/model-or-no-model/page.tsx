import ModelOrNoModelPage from '@/components/robotics-page/areas/ModelOrNoModelPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Model or no model | DoDAO Robotics',
  description:
    'How DoDAO decides, stage by stage, whether a learned model or a programmed approach should handle perception, grasping, motion and control in a robot cell.',
  alternates: { canonical: 'https://dodao.io/robotics/model-or-no-model' },
};

export default function ModelOrNoModelRoute() {
  return <ModelOrNoModelPage />;
}
