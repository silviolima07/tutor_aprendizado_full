// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

function AdminDashboard() {
  alert('AdminDashboard V2 carregado');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    //alert('AdminDashboard carregado');
    const fetchMetrics = async () => {
      try {
        console.log('📊 Buscando métricas do admin...');
        const response = await fetch(`${API_URL}/admin/metrics`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        console.log("JSON recebido pelo navegador:");
        console.log(data);

        alert(JSON.stringify(data, null, 2));

        setMetrics(data);
        console.log('📊 Métricas recebidas:', data);
        //setMetrics(data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Erro ao carregar métricas:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // 🔄 Força a renderização mesmo com dados vazios
  console.log('🔄 Renderizando dashboard com:', metrics);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Carregando métricas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Erro</p>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!metrics) {
    return <div>Nenhum dado disponível</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">📊 Dashboard Administrativo</h2>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600">Total de Usuários</h3>
          <p className="text-3xl font-bold text-blue-800">{metrics.total_users || 0}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600">Alunos</h3>
          <p className="text-3xl font-bold text-green-800">{metrics.students || 0}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600">Administradores</h3>
          <p className="text-3xl font-bold text-purple-800">{metrics.admins || 0}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600">Tokens Utilizados</h3>
          <p className="text-3xl font-bold text-yellow-800">{metrics.total_tokens || 0}</p>
        </div>
      </div>

      {/* CUSTO E REQUISIÇÕES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600">💰 Custo Total</h3>
          <p className="text-2xl font-bold text-red-800">${metrics.total_cost?.toFixed(4) || '0.0000'}</p>
          <p className="text-sm text-gray-500">Últimos 30 dias</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600">📞 Requisições</h3>
          <p className="text-2xl font-bold text-indigo-800">{metrics.total_requests || 0}</p>
          <p className="text-sm text-gray-500">Total de chamadas à API</p>
        </div>
      </div>

      {/* ⭐ MODELOS USADOS - TABELA 1 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">🤖 Modelos Utilizados</h3>
        {metrics.model_summary && metrics.model_summary.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3">Modelo</th>
                  <th className="text-right py-2 px-3">Tokens</th>
                  <th className="text-right py-2 px-3">Custo</th>
                </tr>
              </thead>
              <tbody>
                {metrics.model_summary.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{item.model}</td>
                    <td className="text-right py-2 px-3">{item.tokens || 0}</td>
                    <td className="text-right py-2 px-3">${item.cost?.toFixed(4) || '0.0000'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Nenhum modelo utilizado ainda.</p>
        )}
      </div>

      {/* ⭐ CONSUMO POR ALUNO - TABELA 2 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">👨‍🎓 Consumo por Aluno</h3>
        {metrics.users_summary && metrics.users_summary.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3">Aluno</th>
                  <th className="text-right py-2 px-3">Requisições</th>
                  <th className="text-right py-2 px-3">Tokens</th>
                  <th className="text-right py-2 px-3">Custo</th>
                </tr>
              </thead>
              <tbody>
                {metrics.users_summary.map((user, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{user.user_name}</td>
                    <td className="text-right py-2 px-3">{user.requests || 0}</td>
                    <td className="text-right py-2 px-3">{user.tokens || 0}</td>
                    <td className="text-right py-2 px-3">${user.cost?.toFixed(4) || '0.0000'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Nenhum consumo registrado ainda.</p>
        )}
      </div>

      {/* ⭐ ATIVIDADES RECENTES - TABELA 3 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">🔄 Atividades Recentes</h3>
        {metrics.recent_requests && metrics.recent_requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3">Usuário</th>
                  <th className="text-left py-2 px-3">Modelo</th>
                  <th className="text-right py-2 px-3">Tokens</th>
                  <th className="text-right py-2 px-3">Custo</th>
                  <th className="text-left py-2 px-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recent_requests.map((req, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{req.user}</td>
                    <td className="py-2 px-3">{req.model}</td>
                    <td className="text-right py-2 px-3">{req.tokens || 0}</td>
                    <td className="text-right py-2 px-3">${req.cost?.toFixed(4) || '0.0000'}</td>
                    <td className="py-2 px-3 text-sm">
                      {req.timestamp ? new Date(req.timestamp).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma atividade recente.</p>
        )}
      </div>

      {/* USUÁRIOS RECENTES */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">📋 Últimos Alunos Cadastrados</h3>
        {metrics.recent_users && metrics.recent_users.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {metrics.recent_users.map((user, index) => (
              <li key={index} className="py-2 flex justify-between items-center">
                <span className="font-medium">{user.name}</span>
                <span className="text-gray-600">{user.email}</span>
                <span className="text-sm text-gray-500">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhum aluno cadastrado ainda.</p>
        )}
      </div>

      {/* DEBUG */}
      <details className="mt-6">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
          🔧 Dados brutos (debug)
        </summary>
        <pre className="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(metrics, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default AdminDashboard;