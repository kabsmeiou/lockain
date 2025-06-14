import { useEffect, useState } from "react";
import { Question, QuizItemDetails } from "../../types/quiz";

interface QuizItemProps {
    question: Question;
    setNumberOfQuestionsAnswered: React.Dispatch<React.SetStateAction<number>>;
    answers: Record<number, string>;
    setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    result: QuizItemDetails[];
    hasSubmitted: boolean;
}

const QuizItem = ({
    question,
    setNumberOfQuestionsAnswered,
    answers,
    setAnswers,
    result,
    hasSubmitted
}: QuizItemProps) => {
    const [selectedOption, setSelectedOption] = useState<string>("");
    useEffect(() => {
        // Reset the selected option when a new question is shown
        setSelectedOption("");
    }, [question.id]);

    const handleChange = (value: string) => {
        // if question did not have an answer, increment the number of questions answered
        const wasAnswered = answers.hasOwnProperty(Number(question.id));
        if (!wasAnswered) {
            setNumberOfQuestionsAnswered(prev => prev + 1);
        }
        setSelectedOption(value);
        setAnswers(prev => ({ ...prev, [Number(question.id)]: value }));
    };

    // Find the result for this question if available
    const questionResult = result.length > 0 ? result.find(r => r.question_id === question.id) : null;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-gray-50 dark:bg-surface-800/60 p-2 md:p-6 rounded-lg md:text-xl text-lg">
                <h2 className="font-medium text-gray-800 dark:text-gray-100 mb-3">{question.question}</h2>
                {questionResult && (
                    <div className={`mt-2 flex items-center ${questionResult.is_correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <span className={`inline-flex items-center justify-center md:w-6 md:h-6 w-4 h-4 rounded-full mr-2 ${questionResult.is_correct ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                            {questionResult.is_correct ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            )}
                        </span>
                        <span className="font-medium">
                            {questionResult.is_correct ? 'Correct' : 'Incorrect'}
                            {!questionResult.is_correct && questionResult.correct_answer && (
                                <span className="ml-2 text-sm">(Correct answer: {questionResult.correct_answer})</span>
                            )}
                        </span>
                    </div>
                )}
            </div>
            
            <div className="mt-2">
                <h3 className="text-md font-medium text-gray-500 dark:text-gray-400 mb-3">Select an answer:</h3>
                <ul className="space-y-3 sm:text-base text-sm">
                {question.question_type === "MCQ" ? (
                    question.options.map((option, idx) => {
                        const optionLetter = String.fromCharCode(97 + idx); // "a", "b", "c", ...
                        const isSelected = answers[Number(question.id)] === optionLetter;
                        
                        return (
                            <li key={option.id}>
                                <label 
                                    htmlFor={`question-${question.id}-option${idx}`}
                                    className={`flex items-center p-4 rounded-lg border ${
                                        isSelected 
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-surface-700'
                                    } cursor-pointer transition-all duration-200`}
                                >
                                    <div className={`w-5 h-5 flex-shrink-0 rounded-full border ${
                                        isSelected 
                                            ? 'border-primary-500 bg-primary-500 dark:bg-primary-600' 
                                            : 'border-gray-300 dark:border-gray-600'
                                    } flex items-center justify-center mr-3`}>
                                        {isSelected && (
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        )}
                                    </div>
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        id={`question-${question.id}-option${idx}`}
                                        checked={isSelected}
                                        onChange={() => handleChange(optionLetter)}
                                        className="sr-only"
                                        disabled={hasSubmitted}
                                    />
                                    <span className="font-medium mr-2">{optionLetter}.</span>
                                    <span>{option.text}</span>
                                </label>
                            </li>
                        );
                    })
                ) : (
                    <>
                        <li>
                            <label 
                                htmlFor={`question-${question.id}-option-true`}
                                className={`flex items-center p-4 rounded-lg border ${
                                    answers[Number(question.id)] === "true" 
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-surface-700'
                                } cursor-pointer transition-all duration-200`}
                            >
                                <div className={`w-5 h-5 flex-shrink-0 rounded-full border ${
                                    answers[Number(question.id)] === "true" 
                                        ? 'border-primary-500 bg-primary-500 dark:bg-primary-600' 
                                        : 'border-gray-300 dark:border-gray-600'
                                } flex items-center justify-center mr-3`}>
                                    {answers[Number(question.id)] === "true" && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    id={`question-${question.id}-option-true`}
                                    checked={answers[Number(question.id)] === "true"}
                                    onChange={() => handleChange("true")}
                                    className="sr-only"
                                    disabled={hasSubmitted}
                                />
                                <span className="font-medium">True</span>
                            </label>
                        </li>
                        <li>
                            <label 
                                htmlFor={`question-${question.id}-option-false`}
                                className={`flex items-center p-4 rounded-lg border ${
                                    answers[Number(question.id)] === "false" 
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-surface-700'
                                } cursor-pointer transition-all duration-200`}
                            >
                                <div className={`w-5 h-5 flex-shrink-0 rounded-full border ${
                                    answers[Number(question.id)] === "false" 
                                        ? 'border-primary-500 bg-primary-500 dark:bg-primary-600' 
                                        : 'border-gray-300 dark:border-gray-600'
                                } flex items-center justify-center mr-3`}>
                                    {answers[Number(question.id)] === "false" && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    id={`question-${question.id}-option-false`}
                                    checked={answers[Number(question.id)] === "false"}
                                    onChange={() => handleChange("false")}
                                    className="sr-only"
                                    disabled={hasSubmitted}
                                />
                                <span className="font-medium">False</span>
                            </label>
                        </li>
                    </>
                )}
                </ul>
            </div>
        </div>
    );
};

export default QuizItem;
