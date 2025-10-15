 'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';
import { authService } from '@/services/auth';
import AuthModal from '@/components/AuthModal';

export default function Home() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if Webhook URL is already configured
    const savedUrl = apiService.getConfiguredWebhookUrl();
    if (savedUrl) {
      setWebhookUrl(savedUrl);
    }

    // Check authentication status
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;

    setIsLoading(true);
    try {
      // Remove trailing slash if present
      const cleanUrl = webhookUrl.trim().replace(/\/$/, '');
      apiService.setWebhookUrl(cleanUrl);

      // Redirect to processes page
      router.push('/processes');
    } catch (error) {
      console.error('Error saving Webhook URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToProcesses = () => {
    router.push('/processes');
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Process Monitor
          </h1>
          <p className="text-gray-300 text-lg">
            Monitore e analise processos do sistema pelo kernel
          </p>

          {/* Auth Status */}
          {isAuthenticated && (
            <div className="mt-4 inline-flex items-center bg-green-500/20 border border-green-400/30 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">
                Logado como {authService.getUser()?.name}
              </span>
              <button
                onClick={handleLogout}
                className="ml-3 text-green-300 hover:text-white transition-colors text-sm underline"
              >
                Sair
              </button>
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Configuração do Webhook
            </h2>
            <p className="text-gray-300 text-sm">
              Configure a URL do webhook que será consultado para monitorar os processos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-200 mb-3">
                Webhook URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="http://localhost:3000"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                URL do webhook que será consultado para obter os processos
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !webhookUrl.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Conecte-se & comece a Explorar
                </div>
              )}
            </button>
          </form>

          {/* Login Button */}
          {!isAuthenticated && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full bg-white/10 border border-white/20 text-white py-3 px-6 rounded-lg font-medium hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Login / Criar Conta
                </div>
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                Faça login para salvar suas sessões exploratórias
              </p>
            </div>
          )}

          {/* Already Configured Section */}
          {apiService.isWebhookConfigured() && (
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-300">Webhook Já Configurado</span>
              </div>
              <div className="bg-black/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-400 mb-1">Webhook URL atual:</p>
                <p className="font-mono text-sm text-white break-all">
                  {apiService.getConfiguredWebhookUrl()}
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleGoToProcesses}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Explorar Processos
                  </div>
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => router.push('/history')}
                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ver Histórico de Sessões
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Processo de monitoramento seguro com updates em tempo-real
          </p>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}