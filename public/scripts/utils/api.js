class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Erro desconhecido' };
      }
      
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Erro de rede ou outros
    console.error('Erro na requisição:', error);
    throw new ApiError(
      'Falha na conexão. Verifique sua internet e tente novamente.',
      0,
      { originalError: error.message }
    );
  }
}

// Exemplo de uso:
export const api = {
  async getRiskAssessment(studentId) {
    return safeFetch(`/api/risk/${studentId}`);
  },
  
  async registerIntervention(data) {
    return safeFetch('/api/interventions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};