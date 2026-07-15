import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { API_URL } from '../config';

function Quiz() {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`${API_URL}/mock/quiz?lesson_id=${id}`);
        const data = await res.json();
        setQuestions(data.questions || []);
        setAnswers(new Array(data.questions?.length || 0).fill(-1));
      } catch (err) {
        console.error('Erro ao carregar quiz:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [id]);

  const selectAnswer = (qIndex, optIndex) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[qIndex] = optIndex;
      return updated;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/mock/quiz-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: parseInt(id), answers }),
      });
      setResult(await res.json());
    } catch (err) {
      console.error('Erro ao enviar quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="page-enter max-w-lg mx-auto mt-10 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <span className="text-5xl block mb-4">{result.percentual_acertos >= 80 ? '🎉' : '📚'}</span>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Resultado do Quiz</h2>
          <p className="text-4xl font-extrabold text-blue-600 mb-2">{result.percentual_acertos}%</p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {result.percentual_acertos >= 80 ? 'Parabéns! Excelente resultado!' : 'Continue estudando, você vai melhorar!'}
          </p>
          {result.badge && (
            <span className="inline-block px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
              🏆 Badge: {result.badge}
            </span>
          )}
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/dashboard" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Dashboard
            </Link>
            <Link to="/progress" className="px-5 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
              Ver Progresso
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-2xl mx-auto mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">📝 Quiz — Aula #{id}</h2>

      {questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
          <p className="font-medium text-gray-800 dark:text-white mb-3">{qIdx + 1}. {q.q}</p>
          <div className="space-y-2">
            {q.options.map((opt, oIdx) => (
              <button
                key={oIdx}
                onClick={() => selectAnswer(qIdx, oIdx)}
                className={`w-full text-left px-4 py-2 rounded-lg border transition-colors text-sm ${answers[qIdx] === oIdx
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={submitting || answers.includes(-1)}
        className="btn-glow w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Enviando...' : 'Enviar Respostas'}
      </button>
    </div>
  );
}

export default Quiz;
