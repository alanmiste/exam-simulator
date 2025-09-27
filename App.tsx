
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Question } from './types';
import { ALL_QUESTIONS } from './constants/questions';
import Timer from './components/Timer';

type ExamState = 'not-started' | 'in-progress' | 'finished';
type UserAnswers = { [key: number]: number };

const EXAM_DURATION = 30 * 60; // 30 minutes in seconds
const TOTAL_QUESTIONS = 40;

const App: React.FC = () => {
  const [examState, setExamState] = useState<ExamState>('not-started');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(EXAM_DURATION);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean>(false);

  const handleFinishExam = useCallback(() => {
    let correctAnswers = 0;
    examQuestions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswerIndex) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setExamState('finished');
  }, [examQuestions, userAnswers]);

  useEffect(() => {
    if (examState !== 'in-progress') return;

    if (timeLeft === 0) {
      handleFinishExam();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [examState, timeLeft, handleFinishExam]);

  const handleStartExam = () => {
    const shuffled = [...ALL_QUESTIONS].sort(() => 0.5 - Math.random());
    setExamQuestions(shuffled.slice(0, TOTAL_QUESTIONS));
    setTimeLeft(EXAM_DURATION);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowCorrectAnswer(false);
    setScore(0);
    setExamState('in-progress');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showCorrectAnswer) return;
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: answerIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowCorrectAnswer(false);
    }
  };

  const currentQuestion = useMemo(() => examQuestions[currentQuestionIndex], [examQuestions, currentQuestionIndex]);

  const renderContent = () => {
    switch (examState) {
      case 'in-progress':
        if (!currentQuestion) return null;
        const userAnswer = userAnswers[currentQuestionIndex];

        return (
          <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">
              <header className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-300">Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}</h2>
                <Timer timeLeft={timeLeft} />
              </header>
              
              <div className="w-full bg-slate-700 rounded-full h-2.5 mb-6">
                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}></div>
              </div>

              <div className="mb-6">
                <p className="text-2xl font-medium leading-relaxed text-slate-100">{currentQuestion.question}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = userAnswer === index;
                  const isCorrect = currentQuestion.correctAnswerIndex === index;
                  
                  let buttonClass = 'bg-slate-700 hover:bg-slate-600';
                  if (showCorrectAnswer) {
                    if (isCorrect) buttonClass = 'bg-green-600';
                    else if (isSelected && !isCorrect) buttonClass = 'bg-red-600';
                  } else if (isSelected) {
                    buttonClass = 'bg-blue-600';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showCorrectAnswer}
                      className={`p-4 rounded-lg text-left transition-all duration-200 text-lg ${buttonClass} disabled:opacity-75 disabled:cursor-not-allowed`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <footer className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => setShowCorrectAnswer(true)}
                  disabled={showCorrectAnswer}
                  className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  Show Correct Answer
                </button>
                {currentQuestionIndex < TOTAL_QUESTIONS - 1 ? (
                  <button onClick={handleNextQuestion} className="w-full sm:w-auto px-8 py-3 bg-cyan-500 text-slate-900 font-bold rounded-lg hover:bg-cyan-400 transition-colors">
                    Next
                  </button>
                ) : (
                  <button onClick={handleFinishExam} className="w-full sm:w-auto px-8 py-3 bg-green-500 text-slate-900 font-bold rounded-lg hover:bg-green-400 transition-colors">
                    Finish
                  </button>
                )}
              </footer>
            </div>
          </div>
        );
      case 'finished':
        const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center">
                <h1 className="text-4xl font-bold text-cyan-400 mb-4">Exam Finished!</h1>
                <p className="text-xl text-slate-300 mb-2">You have completed the exam.</p>
                <p className="text-6xl font-extrabold my-8">{percentage}%</p>
                <p className="text-2xl text-slate-200 mb-8">
                  Your score is <span className="font-bold text-cyan-400">{score}</span> out of <span className="font-bold">{TOTAL_QUESTIONS}</span>.
                </p>
                <button onClick={handleStartExam} className="w-full px-8 py-4 bg-cyan-500 text-slate-900 font-bold rounded-lg hover:bg-cyan-400 transition-colors text-xl">
                  Try Again
                </button>
            </div>
          </div>
        );
      case 'not-started':
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-slate-100">Exam Simulator</h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl">
              Test your knowledge with a {TOTAL_QUESTIONS}-question exam. You have {EXAM_DURATION / 60} minutes to complete it.
            </p>
            <button onClick={handleStartExam} className="px-10 py-5 bg-cyan-500 text-slate-900 font-bold rounded-lg hover:bg-cyan-400 transition-transform hover:scale-105 text-2xl">
              Start Exam
            </button>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 font-sans p-4">
      {renderContent()}
    </main>
  );
};

export default App;
