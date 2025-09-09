import { lazy, ComponentType } from 'react';

// Wrapper para importações dinâmicas que garante tratamento de erros
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallbackComponent?: ComponentType
) {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error('Erro ao carregar componente dinamicamente:', error);
      
      // Retornar componente de fallback ou componente de erro padrão
      if (fallbackComponent) {
        return { default: fallbackComponent };
      }
      
      // Componente de erro padrão
      return {
        default: () => (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-4">
                error ao carregar página
              </h2>
              <p className="text-gray-600 mb-4">
                Ocorreu um erro ao carregar esta página. Tente recarregar a página.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        )
      };
    }
  });
}

// Função auxiliar para criar importações dinâmicas com retry
export function createLazyComponentWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  maxRetries: number = 3,
  fallbackComponent?: ComponentType
) {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Tentativa ${attempt}/${maxRetries} falhou ao carregar componente:`, error);
        
        if (attempt < maxRetries) {
          // Aguardar um pouco antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    console.error('Todas as tentativas falharam ao carregar componente:', lastError);
    
    // Retornar componente de fallback ou erro
    if (fallbackComponent) {
      return { default: fallbackComponent };
    }
    
    return {
      default: () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Erro ao carregar página
            </h2>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar esta página após várias tentativas.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      )
    };
  });
}
