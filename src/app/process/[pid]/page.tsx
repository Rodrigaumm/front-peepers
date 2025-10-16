'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiService } from '@/services/api';
import { ProcessInfo, ProcessByPidResponse } from '@/types/api';

export default function ProcessDetailPage() {
  const [processInfo, setProcessInfo] = useState<ProcessInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const pid = parseInt(params.pid as string);

  useEffect(() => {
    if (!apiService.isWebhookConfigured()) {
      router.push('/');
      return;
    }

    if (isNaN(pid)) {
      setError('Invalid process ID');
      setIsLoading(false);
      return;
    }

    fetchProcessDetails();
  }, [router, pid]);

  const fetchProcessDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: ProcessByPidResponse = await apiService.getProcessByPid(pid);

      if (response.success) {
        setProcessInfo(response.processInfo);
      } else {
        setError(response.error || 'Failed to fetch process details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching process details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/processes');
  };

  const handleRefresh = () => {
    fetchProcessDetails();
  };

  const handleProcessClick = (processId: number) => {
    if (!processId) return;

    router.push(`/process/${processId}`);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number): string => {
    return num ? num.toLocaleString() : '0';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes dos processos...</p>
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
              onClick={handleRefresh}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={handleBack}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Voltar para Processos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!processInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Process Not Found</h2>
          <p className="text-gray-600 mb-6">The requested process could not be found.</p>
          <button
            onClick={handleBack}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Voltar aos Processos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-8xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{processInfo.processName}</h1>
                <p className="text-gray-600 mt-1">
                  PID: {processInfo.processId} • Threads: {processInfo.threadCount}
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Process Details */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center">
          {/* ActiveProcessLinks */}
          <div className="flex-[2_1] bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Estrutura ActiveProcessLinks
            </h2>
            <div>
               {processInfo.previousProcess && ( 
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out" onClick={() => handleProcessClick(processInfo.previousProcess.processId)}>
                    <h1 className="bg-indigo-600 text-white text-center mb-4">Processo Anterior (Backlink)</h1>
                    
                          <div>
                            <div className="mb-4">
                              <span className="text-gray-600 block text-sm font-medium mb-1">ID do Processo:</span>
                              <span className="font-mono text-xs bg-gray-100 p-2 rounded block break-all">
                                {processInfo.previousProcess.processId || 'N/A'}
                              </span>
                            </div>
                            <div className="mb-4">
                              <span className="text-gray-600 block text-sm font-medium mb-1">Nome do Processo:</span>
                              <span className="font-mono text-xs bg-gray-100 p-2 rounded block break-all">{processInfo.previousProcess.processName || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 block text-sm font-medium mb-1">Endereço EPROCESS:</span>
                              <span className="font-mono text-xs bg-gray-100 p-2 rounded block break-all">{processInfo.previousProcess.eProcessAddress || 'N/A'}</span>
                            </div>
                          </div>
                    
                  </div>
              )}
            </div>

            {processInfo.commandLine && (
              <div className="mt-6">
                <span className="text-gray-600 block text-sm font-medium mb-2">Command Line:</span>
                <div className="bg-gray-100 p-3 rounded font-mono text-xs break-all">
                  {processInfo.commandLine}
                </div>
              </div>
            )}
          </div>

          <div className="flex-[3_0]">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informações Básicas
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID do Processo:</span>
                  <span className="font-mono text-sm">{processInfo.processId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome do Processo:</span>
                  <span className="font-mono text-sm">{processInfo.processName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Endereço EPROCESS:</span>
                  <span className="font-mono text-sm">{processInfo.currentProcessAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PID do Processo Pai:</span>
                  <span className="font-mono text-sm">{processInfo.parentProcessId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contagem de Threads:</span>
                  <span className="font-mono text-sm">{formatNumber(processInfo.threadCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID da Sessão:</span>
                  <span className="font-mono text-sm">{processInfo.sessionID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contagem de Handles:</span>
                  <span className="font-mono text-sm">{formatNumber(processInfo.handleCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prioridade Base:</span>
                  <span className="font-mono text-sm">{processInfo.basePriority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tempo decorrido:</span>
                  <span className="font-mono text-sm">{processInfo.createTime}</span>
                </div>
              </div>
            </div>

            {/* Memory Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Uso de Memória
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Memória física usada:</span>
                  <span className="font-mono text-sm">{formatBytes(processInfo.workingSetSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Máximo de memória física alocada:</span>
                  <span className="font-mono text-sm">{formatBytes(processInfo.peakWorkingSetSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tamanho Virtual:</span>
                  <span className="font-mono text-sm">{formatBytes(processInfo.virtualSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maior tamanho virtual:</span>
                  <span className="font-mono text-sm">{formatBytes(processInfo.peakVirtualSize)}</span>
                </div>
{/*                 <div className="flex justify-between">
                  <span className="text-gray-600">Páginas de Arquivo usadas:</span>
                  <span className="font-mono text-sm">{formatBytes(processInfo.pageFileUsage)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Máximo de Páginas de Arquivo:</span>
                  <span className="font-mono text-sm">{formatBytes(processInfo.peakPageFileUsage)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uso Privado:</span>
                  <span className="font-mono text-sm">{formatBytes(processInfo.privateUsage)}</span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Falta de Página:</span>
                  <span className="font-mono text-sm">{formatNumber(processInfo.pageFaultCount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ActiveProcessLinks */}
          <div className="flex-[2_1] bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Estrutura ActiveProcessLinks
            </h2>
            <div>
                {processInfo.nextProcess && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out" onClick={() => handleProcessClick(processInfo.nextProcess.processId)}>
                      <h1 className="bg-green-600 text-white text-center mb-4">Processo Adiante (Forwardlink)</h1>
                            <div>
                              <div className="mb-4">
                                <span className="text-gray-600 block text-sm font-medium mb-1">ID do Processo:</span>
                                <span className="font-mono text-xs bg-gray-100 p-2 rounded block break-all">
                                  {processInfo.nextProcess.processId || 'N/A'}
                                </span>
                              </div>
                              <div className="mb-4">
                                <span className="text-gray-600 block text-sm font-medium mb-1">Nome do Processo:</span>
                                <span className="font-mono text-xs bg-gray-100 p-2 rounded block break-all">{processInfo.nextProcess.processName || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 block text-sm font-medium mb-1">Endereço EPROCESS:</span>
                                <span className="font-mono text-xs bg-gray-100 p-2 rounded block break-all">{processInfo.nextProcess.eProcessAddress || 'N/A'}</span>
                              </div>
                            </div>
                    </div>
                  )}
            </div>

            {processInfo.commandLine && (
              <div className="mt-6">
                <span className="text-gray-600 block text-sm font-medium mb-2">Command Line:</span>
                <div className="bg-gray-100 p-3 rounded font-mono text-xs break-all">
                  {processInfo.commandLine}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}