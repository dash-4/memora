import { useSearchParams } from 'react-router-dom';
import LearningSession from '@/components/study/LearningSession';
import PracticeSession from '@/components/study/PracticeSession'; 
import Layout from '@/components/layout/Layout';
import { AlertCircle, BookOpen } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function StudyMode() {
  const [searchParams] = useSearchParams();

  const deckId = searchParams.get('deck');
  const mode = searchParams.get('mode') || 'learning';

  if (!deckId) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 sm:px-6">
          <AlertCircle className="h-20 w-20 text-red-500 mb-6" />

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Колода не выбрана
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Выберите колоду из списка, чтобы начать тренировку или обучение
          </p>

          <Button
            size="lg"
            onClick={() => window.location.href = '/decks'}
            className="min-w-[240px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
          >
            К списку колод
          </Button>
        </div>
      </Layout>
    );
  }

  if (mode === 'practice') {
    return (
      <Layout>
        <PracticeSession deckId={deckId} />
      </Layout>
    );
  }

  return (
    <Layout>
      <LearningSession deckId={deckId} />
    </Layout>
  );
}