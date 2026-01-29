import { useSearchParams } from 'react-router-dom';
import LearningMode from './LearningMode';
import PracticeMode from './PracticeMode';

const StudyMode = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'learning';

  if (mode === 'practice') {
    return <PracticeMode />;
  }

  return <LearningMode />;
};

export default StudyMode;
