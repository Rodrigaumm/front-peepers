'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';
import { ProcessBasic, IterateProcessesResponse, ProcessInfo } from '@/types/api';

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processCount, setProcessCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Check if API is configured
    if (!apiService.isApiConfigured()) {
      router.push('/');
      return;
    }

    fetchProcesses();
  }, [router]);

  const fetchProcesses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: IterateProcessesResponse = await apiService.iterateProcesses();
      
      if (response.success) {
        setProcesses(response.processes || []);
        setProcessCount(response.processCount);
      } else {
        setError('Failed to fetch processes from API');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching processes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessClick = (processId: number) => {
    router.push(`/process/${processId}`);
  };

  const handleRefresh = () => {
    fetchProcesses();
  };

  const handleConfigureApi = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading processes...</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={handleConfigureApi}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Configurar API
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
              <h1 className="text-2xl font-bold text-gray-900">Process Monitor</h1>
              <p className="text-gray-600 mt-1">
                {processCount} processos encontrados
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Atualizar</span>
              </button>
              <button
                onClick={handleConfigureApi}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Configurar API
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Process List */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {processes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No processes found</h3>
            <p className="text-gray-600">Try refreshing to load processes from the API.</p>
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
                      onClick={() => handleProcessClick(process.processId)}
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