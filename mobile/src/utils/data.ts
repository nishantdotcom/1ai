import { Model } from '../types/api';

export interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
}

export const APPS_DATA: AppItem[] = [
  {
    id: 'article-summarizer',
    name: 'Article Summarizer',
    description: 'Summarize articles and web content',
    icon: 'document-text',
  },
  {
    id: 'youtube-summarizer',
    name: 'YouTube Summarizer',
    description: 'Summarize YouTube videos',
    icon: 'play-circle',
    comingSoon: true,
  },
  {
    id: 'pdf-analyzer',
    name: 'PDF Analyzer',
    description: 'Analyze and extract insights from PDFs',
    icon: 'document',
    comingSoon: true,
  },
  {
    id: 'image-analyzer',
    name: 'Image Analyzer',
    description: 'Analyze and describe images',
    icon: 'camera',
    comingSoon: true,
  },
];

export const MODELS_DATA: Model[] = [
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Fast and efficient Google model',
    isPremium: false,
    provider: 'Google',
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Google\'s most advanced model',
    isPremium: true,
    provider: 'Google',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    description: 'Advanced reasoning model',
    isPremium: true,
    provider: 'DeepSeek',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B',
    description: 'Meta\'s powerful language model',
    isPremium: true,
    provider: 'Meta',
  },
  {
    id: 'mistralai/mistral-small-24b-instruct-2501:free',
    name: 'Mistral Small 24B',
    description: 'Mistral\'s efficient instruction model',
    isPremium: true,
    provider: 'Mistral',
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    name: 'Qwen 2.5 72B',
    description: 'Alibaba\'s powerful language model',
    isPremium: true,
    provider: 'Qwen',
  },
];