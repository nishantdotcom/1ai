import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

import { ModelSelector } from "../../components/chat/ModelSelector";
import { MessageBubble } from "../../components/chat/MessageBubble";
import { Sidebar } from "../../components/ui/Sidebar";
import { chatAPI, authAPI } from "../../services/api";
import { Message, User } from "../../types/api";
import { spacing, fontSize, borderRadius } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";

export const ChatScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [isStreaming, setIsStreaming] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const conversationId =
    (params.conversationId as string) ||
    (() => {
      // Generate a proper UUID for conversationId if none provided
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    })();

  const flatListRef = useRef<FlatList>(null);
  const streamingMessageRef = useRef("");

  useEffect(() => {
    loadUserData();
    // If conversationId was provided via navigation, load the existing conversation
    if (params.conversationId) {
      loadConversation(params.conversationId as string);
    }
  }, [params.conversationId]);

  const loadUserData = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.user);
    } catch (error) {
      // If user is not authenticated, they can still view the chat screen but won't be able to send messages
    }
  };

  const loadConversation = async (convId: string) => {
    setLoading(true);
    try {
      const response = await chatAPI.getConversation(convId);
      if (response.conversation && response.conversation.messages) {
        // Map the API message format to the app's message format
        const mappedMessages = response.conversation.messages.map(
          (msg: any) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role === "assistant" ? "agent" : msg.role, // Map 'assistant' to 'agent'
            createdAt: msg.createdAt,
          })
        );
        setMessages(mappedMessages);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load conversation",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isStreaming) return;

    // Check if user is authenticated
    if (!user) {
      Toast.show({
        type: "info",
        text1: "Authentication Required",
        text2: "Please sign in to start chatting",
      });
      router.push("/(auth)/signin");
      return;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      content: inputText.trim(),
      role: "user",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsStreaming(true);
    streamingMessageRef.current = "";

    // Add placeholder for streaming message
    const streamingMessage: Message = {
      id: `msg_streaming_${Date.now()}`,
      content: "",
      role: "agent",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, streamingMessage]);

    try {
      await chatAPI.streamChat(
        userMessage.content,
        selectedModel,
        conversationId,
        (chunk: string) => {
          streamingMessageRef.current += chunk;
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === "agent") {
              lastMessage.content = streamingMessageRef.current;
            }
            return newMessages;
          });
        },
        () => {
          setIsStreaming(false);
          // Scroll to bottom after completion
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        },
        (error: string) => {
          setIsStreaming(false);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error,
          });

          // Remove the failed streaming message
          setMessages((prev) => prev.slice(0, -1));
        }
      );
    } catch (error) {
      setIsStreaming(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to send message",
      });

      // Remove the failed streaming message
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleCopyMessage = (content: string) => {
    Clipboard.setString(content);
    Toast.show({
      type: "success",
      text1: "Copied",
      text2: "Message copied to clipboard",
    });
  };

  const clearConversation = () => {
    Alert.alert(
      "Clear Conversation",
      "Are you sure you want to clear this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => setMessages([]),
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      onCopy={
        item.role === "agent"
          ? () => handleCopyMessage(item.content)
          : undefined
      }
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsSidebarVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="menu-outline" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Chat</Text>
          {user && (
            <Text style={styles.creditsText}>{user.credits} credits</Text>
          )}
        </View>
      </View>

      <View style={styles.headerRight}>
        <ModelSelector
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          isPremium={user?.isPremium || false}
        />

        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearConversation}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyTitle}>Loading conversation...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="chatbubble-outline"
          size={64}
          color={colors.mutedForeground}
        />
        <Text style={styles.emptyTitle}>
          {user ? "Start a conversation" : "Welcome to 1ai"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {user
            ? "Choose an AI model and send your first message"
            : "Sign in to start chatting with AI models"}
        </Text>
        {!user && (
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push("/(auth)/signin")}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length === 0 && styles.emptyContent,
          ]}
          ListEmptyComponent={renderEmptyState}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              editable={!isStreaming}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isStreaming) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isStreaming}
            >
              {isStreaming ? (
                <Ionicons
                  name="stop"
                  size={20}
                  color={colors.primaryForeground}
                />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={colors.primaryForeground}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Sidebar
        isVisible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    menuButton: {
      marginRight: spacing.md,
      padding: spacing.xs,
    },
    headerTitleContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: fontSize.xl,
      fontWeight: "bold",
      color: colors.foreground,
    },
    creditsText: {
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    clearButton: {
      marginLeft: spacing.md,
      padding: spacing.xs,
    },
    chatContainer: {
      flex: 1,
    },
    messagesList: {
      flex: 1,
    },
    messagesContent: {
      paddingVertical: spacing.md,
    },
    emptyContent: {
      flex: 1,
      justifyContent: "center",
    },
    emptyState: {
      alignItems: "center",
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      fontSize: fontSize.xl,
      fontWeight: "600",
      color: colors.foreground,
      marginTop: spacing.lg,
    },
    emptySubtitle: {
      fontSize: fontSize.base,
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: spacing.sm,
      lineHeight: 22,
    },
    signInButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      marginTop: spacing.lg,
    },
    signInButtonText: {
      fontSize: fontSize.base,
      fontWeight: "600",
      color: colors.primaryForeground,
    },
    inputContainer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: colors.secondary,
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    textInput: {
      flex: 1,
      fontSize: fontSize.base,
      color: colors.foreground,
      maxHeight: 100,
      minHeight: 36,
      paddingVertical: spacing.xs,
      paddingRight: spacing.sm,
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: spacing.xs,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });
