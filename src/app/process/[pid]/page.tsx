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
    // Check if API is configured
    if (!apiService.isApiConfigured()) {
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

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading process details...</p>
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
              Try Again
            </button>
            <button
              onClick={handleBack}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Processes
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
            Back to Processes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
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
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Process Details */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Basic Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Process ID:</span>
                <span className="font-mono text-sm">{processInfo.processId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Process Name:</span>
                <span className="font-mono text-sm">{processInfo.processName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Parent PID:</span>
                <span className="font-mono text-sm">{processInfo.parentProcessID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thread Count:</span>
                <span className="font-mono text-sm">{formatNumber(processInfo.threadCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Session ID:</span>
                <span className="font-mono text-sm">{processInfo.sessionID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Handle Count:</span>
                <span className="font-mono text-sm">{formatNumber(processInfo.handleCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Priority Base:</span>
                <span className="font-mono text-sm">{processInfo.priorityClassBase}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Elapsed Time:</span>
                <span className="font-mono text-sm">{processInfo.elapsedTime}</span>
              </div>
            </div>
          </div>

          {/* Memory Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Memory Usage
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Working Set:</span>
                <span className="font-mono text-sm">{formatBytes(processInfo.workingSetSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peak Working Set:</span>
                <span className="font-mono text-sm">{formatBytes(processInfo.peakWorkingSetSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Virtual Size:</span>
                <span className="font-mono text-sm">{formatBytes(processInfo.virtualSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peak Virtual Size:</span>
                <span className="font-mono text-sm">{formatBytes(processInfo.peakVirtualSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Page File Usage:</span>
                <span className="font-mono text-sm">{formatBytes(processInfo.pageFileUsage)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peak Page File:</span>
                <span className="font-mono text-sm">{formatBytes(processInfo.peakPageFileUsage)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Private Usage:</span>
                <span className="font-mono text-sm">{formatBytes(processInfo.privateUsage)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Page Faults:</span>
                <span className="font-mono text-sm">{formatNumber(processInfo.pageFaultCount)}</span>
              </div>
            </div>
          </div>

          {/* Process Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Process Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 block text-sm font-medium mb-1">Executable Path:</span>
                  <span className="font-mono text-xs bg-gray-100 p-2 rounded block break-all">
                    {processInfo.executablePath || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block text-sm font-medium mb-1">Owner:</span>
                  <span className="font-mono text-sm">{processInfo.owner || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 block text-sm font-medium mb-1">Company:</span>
                  <span className="font-mono text-sm">{processInfo.company || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 block text-sm font-medium mb-1">Version:</span>
                  <span className="font-mono text-sm">{processInfo.version || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 block text-sm font-medium mb-1">Description:</span>
                  <span className="font-mono text-sm">{processInfo.description || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 block text-sm font-medium mb-1">Window Title:</span>
                  <span className="font-mono text-sm">{processInfo.windowTitle || 'N/A'}</span>
                </div>
              </div>
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