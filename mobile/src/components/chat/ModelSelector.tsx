import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Model } from '../../types/api';
import { MODELS_DATA } from '../../utils/data';
import { spacing, fontSize, borderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  isPremium: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
  isPremium,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedModelData = MODELS_DATA.find((model: Model) => model.id === selectedModel);
  const freeModels = MODELS_DATA.filter((model: Model) => !model.isPremium);
  const premiumModels = MODELS_DATA.filter((model: Model) => model.isPremium);

  const handleModelSelect = (modelId: string) => {
    onSelectModel(modelId);
    setIsModalVisible(false);
  };

  const renderModelItem = ({ item }: { item: Model }) => {
    const isSelected = item.id === selectedModel;
    const isDisabled = item.isPremium && !isPremium;

    return (
      <TouchableOpacity
        style={[
          styles.modelItem,
          isSelected && styles.selectedModelItem,
          isDisabled && styles.disabledModelItem,
        ]}
        onPress={() => !isDisabled && handleModelSelect(item.id)}
        disabled={isDisabled}
      >
        <View style={styles.modelInfo}>
          <View style={styles.modelHeader}>
            <Text style={[
              styles.modelName,
              isSelected && styles.selectedModelName,
              isDisabled && styles.disabledModelName,
            ]}>
              {item.name}
            </Text>
            {item.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color={colors.primary} />
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.modelDescription,
            isDisabled && styles.disabledModelDescription,
          ]}>
            {item.description}
          </Text>
          <Text style={[
            styles.modelProvider,
            isDisabled && styles.disabledModelProvider,
          ]}>
            by {item.provider}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.selectedModelText} numberOfLines={1}>
            {selectedModelData?.name || 'Select Model'}
          </Text>
          {selectedModelData?.isPremium && (
            <View style={styles.miniPremiumBadge}>
              <Ionicons name="star" size={10} color={colors.primary} />
            </View>
          )}
        </View>
        <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select AI Model</Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Free Models</Text>
              <FlatList
                data={freeModels}
                renderItem={renderModelItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Premium Models</Text>
              {!isPremium && (
                <View style={styles.upgradePrompt}>
                  <Ionicons name="lock-closed" size={16} color={colors.primary} />
                  <Text style={styles.upgradeText}>
                    Upgrade to Premium to access advanced models
                  </Text>
                </View>
              )}
              <FlatList
                data={premiumModels}
                renderItem={renderModelItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    minWidth: 120,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedModelText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.foreground,
    flex: 1,
  },
  miniPremiumBadge: {
    marginLeft: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  upgradeText: {
    fontSize: fontSize.sm,
    color: colors.accentForeground,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedModelItem: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  disabledModelItem: {
    opacity: 0.6,
  },
  modelInfo: {
    flex: 1,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modelName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.foreground,
  },
  selectedModelName: {
    color: colors.accentForeground,
  },
  disabledModelName: {
    color: colors.mutedForeground,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: spacing.sm,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 2,
  },
  modelDescription: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  disabledModelDescription: {
    color: colors.mutedForeground,
  },
  modelProvider: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  disabledModelProvider: {
    color: colors.mutedForeground,
  },
});