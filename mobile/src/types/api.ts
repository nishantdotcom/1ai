export interface User {
  id: string;
  email: string;
  credits: number;
  isPremium: boolean;
}

export interface SignInRequest {
  email: string;
}

export interface SignInResponse {
  message: string;
  success: boolean;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  token: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'agent';
  createdAt: string;
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatRequest {
  message: string;
  model: string;
  conversationId: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  provider: string;
}

export interface Plan {
  name: string;
  monthly_price: number;
  plan_id: string;
  currency: string;
  symbol: string;
  pricing_currency: Array<{
    plan_id: string;
    monthly_price: number;
    annual_price: number;
    currency: string;
    symbol: string;
  }>;
}

export interface ApiError {
  message: string;
  success: false;
}