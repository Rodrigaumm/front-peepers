'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiService } from '@/services/api';
import { authService } from '@/services/auth';
import { ProcessInfo } from '@/types/api';

export default function SnapshotDetailPage() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [snapshotInfo, setSnapshotInfo] = useState<{ id: number; type: string; createdAt: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const snapshotId = parseInt(params.id as string);

  useEffect(() => {
    // Check if Webhook is configured
    if (!apiService.isWebhookConfigured()) {
      router.push('/');
      return;
    }

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push('/');
      return;
    }

    if (isNaN(snapshotId)) {
      setError('ID de snapshot inválido');
      setIsLoading(false);
      return;
    }

    fetchSnapshotData();
  }, [router, snapshotId]);

  const fetchSnapshotData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const snapshotResponse = await apiService.getSnapshotProcesses(snapshotId);
      
      if (snapshotResponse.snapshot) {
        const snapshot = snapshotResponse.snapshot;
        setSnapshotInfo({
          id: snapshot.id,
          type: snapshot.snapshotType,
          createdAt: snapshot.createdAt,
        });
      } else {
        setError('Falha ao obter detalhes da Snapshot');
      }

      if (snapshotResponse.processes) {
        setProcesses(snapshotResponse.processes || []);
      } else {
        setError("Falha ao buscar processos da Snapshot");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao buscar a Snapshot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessClick = (processId: number) => {
    router.push(`/history/${snapshotId}/process/${processId}`);
  };

  const handleBack = () => {
    router.push('/history');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    return type === 'iteration' ? 'Iteração Completa' : 'Consulta por PID';
  };

  const getTypeColor = (type: string) => {
    return type === 'iteration' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando snapshot...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchSnapshotData}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={handleBack}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Voltar ao Histórico
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">Snapshot #{snapshotId}</h1>
                    {snapshotInfo && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(snapshotInfo.type)}`}>
                        {getTypeLabel(snapshotInfo.type)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">
                    {processes.length} processo{processes.length !== 1 ? 's' : ''} capturado{processes.length !== 1 ? 's' : ''}
                    {snapshotInfo && ` • ${formatDate(snapshotInfo.createdAt)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process List */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {processes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum processo encontrado</h3>
            <p className="text-gray-600">Este snapshot não contém processos.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            
            {/* Process cards */}
            <div className="space-y-4">
              {processes.map((process) => (
                <div key={process.processId} className="relative">
                  {/* Connection dot */}
                  <div className="absolute left-6 top-6 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-sm z-10"></div>

                  {/* Process card */}
                  <div className="ml-16">
                    <div
                      onClick={() => handleProcessClick(process.id)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="bg-indigo-100 rounded-lg p-2 group-hover:bg-indigo-200 transition-colors">
                              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {process.processName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                PID: {process.processId} • Endereço: {process.currentProcessAddress}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
