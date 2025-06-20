import { Plus, FileText } from "react-feather";
import { useState } from "react";
import QuizForm from "./QuizForm";


const QuizHeader = () => {
  const [showQuizForm, setShowQuizForm] = useState(false);

  // TODO: add a loading state for the quiz form if the quiz is still being generated

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-lg flex-shrink-0 hidden sm:flex">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Course Quizzes</h1>
            <p className="mt-1.5 text-gray-600 dark:text-gray-400">Test your knowledge with auto-generated quizzes</p>
          </div>
        </div>
        
        <button 
          className="inline-flex items-center justify-center gap-2 bg-primary-600 dark:bg-primary-700 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors shadow-sm font-medium"
          onClick={() => setShowQuizForm(true)}
        >
          <Plus size={18} className="flex-shrink-0" />
          <span>Create Quiz</span>
        </button>
      </div>
      
      {/* Divider */}
      <div className="h-px bg-gray-100 dark:bg-gray-700 my-6"></div>

      <QuizForm 
        isOpen={showQuizForm}
        onClose={() => setShowQuizForm(false)}
      />
    </div>
  );
};

export default QuizHeader;