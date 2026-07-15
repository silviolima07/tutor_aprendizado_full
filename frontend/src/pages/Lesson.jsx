import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Chatbot from '../components/Chatbot';

import { API_URL } from '../config';

function Lesson() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await fetch(`${API_URL}/mock/lesson`);
        setLesson(await res.json());
      } catch (err) {
        console.error('Erro ao carregar aula:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLesson();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!lesson) {
    return <p className="text-center text-gray-500 mt-10">Aula não encontrada.</p>;
  }

  return (
    <div className="page-enter max-w-4xl mx-auto mt-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">📖 {lesson.title}</h2>
      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{lesson.content}</p>

      {/* Materials List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mt-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Fontes de Estudo</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {lesson.materials && lesson.materials.map((mat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedMaterial(mat)}
              className={`text-left p-4 rounded-lg border transition-colors ${selectedMaterial?.title === mat.title ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20' : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:border-blue-400'}`}
            >
              <div className="font-semibold text-gray-800 dark:text-white">{mat.type}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{mat.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Material View */}
      {selectedMaterial && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mt-6 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Visualizando: {selectedMaterial.title}</h3>

          {selectedMaterial.type === 'YouTube' ? (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 italic p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                {lesson.videoSummary}
              </p>
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                <iframe
                  src={lesson.videoUrl}
                  title={lesson.title}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="mb-4 text-gray-600 dark:text-gray-300">Este conteúdo é um link externo.</p>
              <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer" className="btn-glow inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Abrir {selectedMaterial.type}
              </a>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4 pt-4 pb-20">
        <Link
          to={`/quiz/${lesson.id}`}
          className="btn-glow px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          Fazer Quiz desta Aula
        </Link>
        <Link
          to="/dashboard"
          className="px-6 py-3 border border-gray-400 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Voltar ao Dashboard
        </Link>
      </div>

      <Chatbot lessonId={lesson.id} />
    </div>
  );
}

export default Lesson;
