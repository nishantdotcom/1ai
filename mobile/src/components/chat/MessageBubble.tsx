import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { Message } from '../../types/api';
import { spacing, fontSize, borderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface MessageBubbleProps {
  message: Message;
  onCopy?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onCopy,
}) => {
  const { colors } = useTheme();
  const isUser = message.role === 'user';
  const styles = createStyles(colors, isUser);

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.agentContainer,
    ]}>
      <View style={styles.bubble}>
        {isUser ? (
          <Text style={[
            styles.messageText,
            styles.userText,
          ]}>
            {message.content}
          </Text>
        ) : (
          <Markdown
            style={{
              body: {
                color: colors.foreground,
                fontSize: fontSize.base,
                lineHeight: 22,
              },
              code_inline: {
                backgroundColor: colors.muted,
                color: colors.foreground,
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 4,
                fontSize: fontSize.sm,
              },
              code_block: {
                backgroundColor: colors.muted,
                color: colors.foreground,
                padding: spacing.sm,
                borderRadius: borderRadius.md,
                fontSize: fontSize.sm,
              },
              strong: {
                color: colors.foreground,
                fontWeight: '700',
              },
              em: {
                color: colors.foreground,
                fontStyle: 'italic',
              },
              link: {
                color: colors.primary,
              },
              blockquote: {
                backgroundColor: colors.muted,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
                paddingLeft: spacing.sm,
                paddingVertical: spacing.xs,
                marginVertical: spacing.xs,
              },
              heading1: {
                fontSize: fontSize.xl,
                fontWeight: 'bold',
                color: colors.foreground,
                marginVertical: spacing.xs,
              },
              heading2: {
                fontSize: fontSize.lg,
                fontWeight: 'bold',
                color: colors.foreground,
                marginVertical: spacing.xs,
              },
              heading3: {
                fontSize: fontSize.base,
                fontWeight: 'bold',
                color: colors.foreground,
                marginVertical: spacing.xs,
              },
              list_item: {
                color: colors.foreground,
                fontSize: fontSize.base,
              },
            }}
          >
            {message.content}
          </Markdown>
        )}
        
        {!isUser && onCopy && (
          <TouchableOpacity
            style={styles.copyButton}
            onPress={onCopy}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons 
              name="copy-outline" 
              size={16} 
              color={colors.mutedForeground} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={[
        styles.timestamp,
        { color: colors.mutedForeground }
      ]}>
        {new Date(message.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );
};

const createStyles = (colors: any, isUser: boolean) => StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  agentContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    position: 'relative',
    backgroundColor: isUser ? colors.primary : colors.secondary,
    borderBottomRightRadius: isUser ? 6 : borderRadius.lg,
    borderBottomLeftRadius: isUser ? borderRadius.lg : 6,
  },
  messageText: {
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  userText: {
    color: colors.primaryForeground,
  },
  copyButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  timestamp: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    marginHorizontal: spacing.xs,
  },
});