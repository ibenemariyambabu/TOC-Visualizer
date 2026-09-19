import React, { useState, useEffect } from 'react';
import { SEED_QUESTIONS } from '../../modules/questions/seedData.js';
import { GraduationCap, Clock, Award, CheckCircle2, XCircle, ArrowRight, AlertTriangle } from 'lucide-react';

export const ExamModePage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<number>(0); // 0 = all
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds

  const questions = SEED_QUESTIONS.filter(
    (q) => selectedModule === 0 || q.moduleNumber === selectedModule
  );

  useEffect(() => {
    let timer: any;
    if (examStarted && !examSubmitted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && examStarted && !examSubmitted) {
      setExamSubmitted(true);
    }
    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, timeLeft]);

  const currentQ = questions[currentQuestionIndex] || questions[0];

  const handleStartExam = () => {
    setExamStarted(true);
    setExamSubmitted(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(1800);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">KTU Exam Mode Simulator</h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard timed evaluation based on KTU 2024 Scheme Theory of Computation syllabus
          </p>
        </div>

        {examStarted && !examSubmitted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 font-mono text-sm font-bold shadow">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {!examStarted ? (
        /* Configuration Screen */
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <GraduationCap className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Configure KTU Test Session</h3>
            <p className="text-xs text-slate-400 mt-1">
              Test your problem-solving speed, construction rigor, and formal proofs.
            </p>
          </div>

          <div className="space-y-3 text-left font-mono text-xs">
            <label className="block text-slate-400">Select Syllabus Module:</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
            >
              <option value={0}>Comprehensive Test (All 4 Modules)</option>
              <option value={1}>Module 1: Foundations, FA, Regex & Arden's Theorem</option>
              <option value={2}>Module 2: CFG & Pushdown Automata</option>
              <option value={3}>Module 3: Turing Machines</option>
              <option value={4}>Module 4: Computability & PCP</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono text-slate-400">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-850">
              <span className="block font-bold text-slate-200">{questions.length}</span>
              <span>Questions</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-850">
              <span className="block font-bold text-slate-200">30 Mins</span>
              <span>Duration</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-850">
              <span className="block font-bold text-slate-200">KTU 2024</span>
              <span>Scheme</span>
            </div>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
          >
            Start Exam Session
          </button>
        </div>
      ) : !examSubmitted ? (
        /* Active Exam Question Runner */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {currentQ.marks} Marks
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                  Level {currentQ.difficulty}
                </span>
              </div>

              <span className="text-xs text-slate-400 font-mono">{currentQ.topic}</span>
            </div>

            <div className="text-base font-medium text-slate-100 leading-relaxed py-2">
              {currentQ.questionText}
            </div>

            {/* Answer Box */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Your Answer / Derivation:
              </label>
              <textarea
                value={userAnswers[currentQ.id] || ''}
                onChange={(e) =>
                  setUserAnswers({ ...userAnswers, [currentQ.id]: e.target.value })
                }
                rows={6}
                placeholder="Type your formal definition, state transitions, or proof here..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Nav & Submit Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 disabled:opacity-30 transition-colors"
              >
                Previous
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={() => setExamSubmitted(true)}
                  className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                >
                  Submit Exam
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Evaluation & Mistake Breakdown */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Exam Completed & Evaluated</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Review your solution against official KTU model answers and learn from common student mistakes.
            </p>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-indigo-400">
                    Q{idx + 1}: {q.questionText}
                  </span>
                  <span className="text-slate-400">{q.marks} Marks</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 font-mono text-xs text-slate-300">
                  <span className="text-emerald-400 font-bold block mb-1">
                    Official Model Answer:
                  </span>
                  {q.solution.finalAnswer}
                </div>

                {q.solution.commonMistakes.length > 0 && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Typical Mistake to Avoid:</span>
                      <span>{q.solution.commonMistakes[0]}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setExamStarted(false)}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Back to Exam Setup
          </button>
        </div>
      )}
    </div>
  );
};
