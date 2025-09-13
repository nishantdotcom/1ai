import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { 
  SignInRequest, 
  SignInResponse, 
  VerifyOtpRequest, 
  VerifyOtpResponse,
  User,
  Conversation,
  Plan
} from '../types/api';
import { API_BASE_URL, APP_CONFIG } from '../utils/constants';
import { MODELS_DATA } from '../utils/data';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: APP_CONFIG.timeout,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-logout on unauthorized
    if (error.response?.status === 401) {
      SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  initiateSignIn: async (data: SignInRequest): Promise<SignInResponse> => {
    const response = await api.post('/auth/initiate_signin', data);
    return response.data;
  },

  signIn: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await api.post('/auth/signin', data);
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const chatAPI = {
  getCredits: async () => {
    const response = await api.get('/ai/credits');
    return response.data;
  },

  getConversations: async (): Promise<{ conversations: Conversation[] }> => {
    const response = await api.get('/execution');
    
    // Filter conversation-type executions and map to conversation format
    const conversationExecutions = response.data.executions?.filter((exec: any) => exec.type === 'CONVERSATION') || [];
    
    const conversations = conversationExecutions.map((exec: any) => ({
      id: exec.id,
      messages: [],
      createdAt: exec.createdAt,
      updatedAt: exec.updatedAt || exec.createdAt,
      title: exec.title
    }));
    
    return { conversations };
  },

  getConversation: async (conversationId: string): Promise<{ conversation: Conversation }> => {
    const response = await api.get(`/ai/conversations/${conversationId}`);
    return response.data;
  },

  deleteChat: async (chatId: string) => {
    const response = await api.delete(`/ai/chat/${chatId}`);
    return response.data;
  },

  streamChat: async (
    message: string, 
    model: string, 
    conversationId: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const requestBody = { message, model, conversationId };

      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
      }

      // Check if body exists and is readable
      if (!response.body) {
        // Try to read as text and parse manually
        const responseText = await response.text();
        
        if (responseText) {
          const lines = responseText.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonData = line.slice(6);
              
              try {
                const data = JSON.parse(jsonData);
                
                if (data.content) {
                  onChunk(data.content);
                } else if (data.done) {
                  onComplete();
                  return;
                } else if (data.error) {
                  onError(data.error);
                  return;
                }
              } catch (e) {
                // Ignore malformed lines
              }
            }
          }
          onComplete();
          return;
        }
        
        throw new Error('Response body is not available for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonData = line.slice(6);
            
            try {
              const data = JSON.parse(jsonData);
              
              if (data.content) {
                onChunk(data.content);
              } else if (data.done) {
                onComplete();
                return;
              } else if (data.error) {
                onError(data.error);
                return;
              }
            } catch (e) {
              // Ignore malformed SSE data
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError(errorMessage);
    }
  },
};

export const billingAPI = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.post('/billing/get-plans');
    return response.data;
  },

  initSubscribe: async (planType: 'monthly' | 'yearly') => {
    const response = await api.post('/billing/init-subscribe', { planType });
    return response.data;
  },

  verifyPayment: async (paymentData: {
    signature: string;
    razorpay_payment_id: string;
    orderId: string;
  }) => {
    const response = await api.post('/billing/verify-payment', paymentData);
    return response.data;
  },

  getCredits: async (userId: string) => {
    const response = await api.get(`/billing/credits/${userId}`);
    return response.data;
  },
};

// Export models data from constants
export const modelsData = MODELS_DATA;

export default api;