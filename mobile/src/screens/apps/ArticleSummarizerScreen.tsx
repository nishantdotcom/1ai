import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

import { Button } from '../../components/ui/Button';
import { authAPI } from '../../services/api';
import { User } from '../../types/api';
import { spacing, fontSize, borderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE_URL } from '../../utils/constants';
import * as Clipboard from 'expo-clipboard';

export const ArticleSummarizerScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authAPI.getMe();
      setUser(userData.user);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await Clipboard.setStringAsync(content);
      Toast.show({
        type: 'success',
        text1: 'Copied',
        text2: 'Content copied to clipboard',
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to copy',
        text2: 'Could not copy content',
      });
    }
  };

  const processStream = async (response: Response) => {
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from API:', response.statusText, errorText);
      setError(`Error ${response.status}: ${response.statusText}`);
      setIsLoading(false);
      return;
    }

    try {
      const reader = response.body?.getReader();
      if (!reader) {
        console.error('No reader available');
        setIsLoading(false);
        return;
      }

      setResponse('');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = new TextDecoder().decode(value);
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.trim() === '') continue;

          if (line.startsWith('data: ')) {
            const data = line.substring(6);

            if (data === '[DONE]') {
              continue;
            }

            try {
              if (data.startsWith('{') && data.endsWith('}')) {
                try {
                  const parsedData = JSON.parse(data);
                  if (parsedData.error) {
                    setResponse(prev => prev + `Error: ${parsedData.error}\n`);
                    continue;
                  }
                } catch {
                  // If parsing fails, treat as plain text
                }
              }
              
              if (data && data !== '[DONE]') {
                setResponse(prev => prev + data);
              }
            } catch (e) {
              console.error('Error processing data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing stream:', error);
      setResponse('Error: Failed to process response');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push('/(auth)/signin');
      return;
    }

    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setResponse('');
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const token = await import('expo-secure-store').then(SecureStore => 
        SecureStore.getItemAsync('auth_token')
      );

      const response = await fetch(`${API_BASE_URL}/apps/article-summarizer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          article: input,
        }),
        signal: abortControllerRef.current?.signal,
      });

      await processStream(response);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sending request:', error);
        setResponse('Error: Failed to send request');
        Toast.show({
          type: 'error',
          text1: 'Request Failed',
          text2: 'Failed to send request to server',
        });
      }
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      Toast.show({
        type: 'info',
        text1: 'Stopped',
        text2: 'Processing stopped',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Article Summarizer</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article Text</Text>
            <Text style={styles.sectionDescription}>
              Paste article text below to get an AI-generated summary
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={input}
                onChangeText={setInput}
                placeholder="Paste article text here..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                editable={!isLoading}
              />
            </View>

            <Button
              title={isLoading ? 'Processing...' : 'Summarize Article'}
              onPress={isLoading ? handleStop : handleSubmit}
              loading={isLoading}
              disabled={!input.trim()}
              fullWidth
              size="lg"
            />
          </View>

          {(response || isLoading || error) && (
            <View style={styles.section}>
              <View style={styles.responseHeader}>
                <Text style={styles.sectionTitle}>Summary</Text>
                {response && !isLoading && (
                  <TouchableOpacity
                    onPress={() => handleCopy(response)}
                    style={styles.copyButton}
                  >
                    <Ionicons name="copy-outline" size={16} color={colors.primary} />
                    <Text style={styles.copyButtonText}>Copy</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.responseContainer}>
                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color={colors.destructive} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {isLoading && !response && !error && (
                  <View style={styles.loadingContainer}>
                    <View style={styles.loadingDots}>
                      <View style={[styles.dot, styles.dot1]} />
                      <View style={[styles.dot, styles.dot2]} />
                      <View style={[styles.dot, styles.dot3]} />
                    </View>
                    <Text style={styles.loadingText}>Analyzing article...</Text>
                  </View>
                )}

                {response && (
                  <ScrollView style={styles.responseScroll} nestedScrollEnabled>
                    <Text style={styles.responseText}>{response}</Text>
                  </ScrollView>
                )}

                {isLoading && response && (
                  <View style={styles.streamingIndicator}>
                    <View style={styles.miniDots}>
                      <View style={[styles.miniDot, styles.miniDot1]} />
                      <View style={[styles.miniDot, styles.miniDot2]} />
                      <View style={[styles.miniDot, styles.miniDot3]} />
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    fontSize: fontSize.base,
    color: colors.foreground,
    minHeight: 120,
    maxHeight: 200,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  copyButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  responseContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 200,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.destructive,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 2,
  },
  dot1: {},
  dot2: {},
  dot3: {},
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  responseScroll: {
    maxHeight: 300,
  },
  responseText: {
    fontSize: fontSize.base,
    color: colors.foreground,
    lineHeight: 24,
  },
  streamingIndicator: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  miniDots: {
    flexDirection: 'row',
  },
  miniDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginHorizontal: 1,
  },
  miniDot1: {},
  miniDot2: {},
  miniDot3: {},
});

