import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { spacing, fontSize, borderRadius } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";
import { chatAPI } from "../../services/api";
import { Conversation } from "../../types/api";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.8;

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  route: string;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const generateConversationTitle = (conversation: Conversation): string => {
  // If conversation has a title from the API, use it
  if ((conversation as any).title) {
    return (conversation as any).title;
  }

  if (conversation.messages.length === 0) {
    return "New conversation";
  }

  const firstUserMessage = conversation.messages.find(
    (msg) => msg.role === "user"
  );
  if (!firstUserMessage) {
    return "New conversation";
  }

  // Truncate the first user message to create a title
  const title = firstUserMessage.content.slice(0, 50);
  return title.length < firstUserMessage.content.length ? `${title}...` : title;
};

const getLastMessage = (conversation: Conversation): string => {
  if (conversation.messages.length === 0) {
    return "";
  }

  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const content = lastMessage.content.slice(0, 60);
  return content.length < lastMessage.content.length
    ? `${content}...`
    : content;
};

const sidebarItems: SidebarItem[] = [
  {
    id: "apps",
    title: "Apps",
    icon: "grid-outline",
    route: "/(main)/apps",
  },
  {
    id: "pricing",
    title: "Pricing",
    icon: "diamond-outline",
    route: "/(main)/pricing",
  },
  {
    id: "profile",
    title: "Profile",
    icon: "person-outline",
    route: "/(main)/settings",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isVisible, onClose }) => {
  const [slideAnim] = useState(new Animated.Value(-SIDEBAR_WIDTH));
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (isVisible) {
      loadConversations();
    }
  }, [isVisible, slideAnim]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.conversations || []);
    } catch (error) {
      // Failed to load conversations
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleChatPress = (conversationId: string) => {
    onClose();
    router.push({
      pathname: "/(main)/chat",
      params: { conversationId },
    });
  };

  const renderChatHistoryItem = (conversation: Conversation) => {
    const title = generateConversationTitle(conversation);
    const lastMessage = getLastMessage(conversation);
    const timestamp = formatRelativeTime(conversation.updatedAt);

    const dynamicStyles = StyleSheet.create({
      chatHistoryItem: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: 2,
      },
      chatContent: {
        flex: 1,
      },
      chatTitle: {
        fontSize: fontSize.sm,
        fontWeight: "600",
        color: colors.foreground,
        marginBottom: lastMessage ? 2 : 0,
      },
      chatLastMessage: {
        fontSize: 11,
        color: colors.mutedForeground,
        marginBottom: 2,
      },
      chatTimestamp: {
        fontSize: 10,
        color: colors.mutedForeground,
        opacity: 0.6,
      },
    });

    return (
      <TouchableOpacity
        key={conversation.id}
        style={dynamicStyles.chatHistoryItem}
        onPress={() => handleChatPress(conversation.id)}
      >
        <View style={dynamicStyles.chatContent}>
          <Text style={dynamicStyles.chatTitle} numberOfLines={1}>
            {title}
          </Text>
          {lastMessage ? (
            <Text style={dynamicStyles.chatLastMessage} numberOfLines={1}>
              {lastMessage}
            </Text>
          ) : null}
          <Text style={dynamicStyles.chatTimestamp}>{timestamp}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSidebarItem = (item: SidebarItem) => {
    const dynamicStyles = StyleSheet.create({
      sidebarItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xs,
      },
      itemIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.accent,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
      },
      itemTitle: {
        flex: 1,
        fontSize: fontSize.base,
        fontWeight: "500",
        color: colors.foreground,
      },
    });

    return (
      <TouchableOpacity
        key={item.id}
        style={dynamicStyles.sidebarItem}
        onPress={() => handleItemPress(item.route)}
      >
        <View style={dynamicStyles.itemIcon}>
          <Ionicons name={item.icon as any} size={20} color={colors.primary} />
        </View>
        <Text style={dynamicStyles.itemTitle}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  const dynamicStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      flexDirection: "row",
    },
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    sidebar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: SIDEBAR_WIDTH,
      backgroundColor: colors.background,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      shadowColor: "#000",
      shadowOffset: {
        width: 2,
        height: 0,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    sidebarContent: {
      flex: 1,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop:
        spacing.xxl +
        (Platform.OS === "ios" ? StatusBar.currentHeight || 60 : 0),
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    newChatButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      justifyContent: "center",
    },
    newChatText: {
      fontSize: fontSize.base,
      fontWeight: "600",
      color: colors.primaryForeground,
      marginLeft: spacing.sm,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    section: {
      paddingVertical: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSize.sm,
      fontWeight: "bold",
      color: colors.mutedForeground,
      marginBottom: spacing.md,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    loadingContainer: {
      alignItems: "center",
      paddingVertical: spacing.lg,
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.mutedForeground,
      textAlign: "center",
      paddingVertical: spacing.lg,
      fontStyle: "italic",
    },
  });

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="none"
      presentationStyle="overFullScreen"
      transparent
    >
      <View style={dynamicStyles.overlay}>
        <TouchableOpacity style={dynamicStyles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            dynamicStyles.sidebar,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView
            style={dynamicStyles.sidebarContent}
            edges={["left", "right"]}
          >
            <View style={dynamicStyles.header}>
              <TouchableOpacity
                style={dynamicStyles.newChatButton}
                onPress={() => {
                  onClose();
                  router.push("/(main)/chat");
                }}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={colors.primaryForeground}
                />
                <Text style={dynamicStyles.newChatText}>New Chat</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={dynamicStyles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Chat History Section */}
              <View style={dynamicStyles.section}>
                <Text style={dynamicStyles.sectionTitle}>Recent Chats</Text>
                {loading ? (
                  <View style={dynamicStyles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : conversations.length > 0 ? (
                  conversations.map(renderChatHistoryItem)
                ) : (
                  <Text style={dynamicStyles.emptyText}>
                    No conversations yet
                  </Text>
                )}
              </View>

              {/* Menu Items Section */}
              <View style={dynamicStyles.section}>
                <Text style={dynamicStyles.sectionTitle}>Menu</Text>
                {sidebarItems.map(renderSidebarItem)}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};
