import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

import { authAPI } from '../../services/api';
import { User } from '../../types/api';
import { spacing, fontSize, borderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface PricingPlan {
  name: string;
  price: number;
  currency: string;
  interval: string;
  description: string;
  highlight: boolean;
  popular: boolean;
  savings?: string;
  features: string[];
}

export const PricingScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [user, setUser] = useState<User | null>(null);

  const pricingPlans: PricingPlan[] = [
    {
      name: 'Monthly',
      price: 99,
      currency: '₹',
      interval: 'per month',
      description: 'Perfect for regular users',
      highlight: false,
      popular: false,
      features: [
        '1,000 credits per month',
        'Access to all AI models',
        'Priority support',
        'Conversation history',
        'Export conversations',
        'Mobile & web access',
      ],
    },
    {
      name: 'Yearly',
      price: 999,
      currency: '₹',
      interval: 'per year',
      description: 'Best value for committed users - Save ₹189 annually!',
      highlight: true,
      popular: true,
      savings: 'Save ₹189',
      features: [
        '12,000 credits per year',
        'Everything in Monthly plan',
        'Priority customer support',
        'Early access to new features',
        'Advanced analytics dashboard',
        'Custom AI model preferences',
        'API access (coming soon)',
        '2 months free (₹198 value)',
      ],
    },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.user);

      if (response.user.isPremium) {
        Toast.show({
          type: 'info',
          text1: 'Already Premium',
          text2: 'You already have a premium subscription',
        });
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!user) {
      router.push('/(auth)/signin');
      return;
    }

    Alert.alert(
      'Payment Required',
      `Complete your ${plan.name} plan payment (${plan.currency}${plan.price}) on our secure web platform.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue to Payment',
          onPress: () => {
            router.push({
              pathname: '/(main)/webview',
              params: { 
                url: 'https://1ai.co/pricing', 
                title: 'Payment - 1ai Pricing' 
              },
            });
          }
        },
      ]
    );
  };

  const renderFeature = (feature: string, index: number) => (
    <View key={index} style={styles.featureItem}>
      <View style={styles.checkIcon}>
        <Ionicons name="checkmark" size={12} color={colors.primary} />
      </View>
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  const renderPlanCard = (plan: PricingPlan) => (
    <View
      key={plan.name}
      style={[
        styles.planCard,
        plan.highlight && styles.highlightedPlan,
      ]}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Ionicons name="star" size={14} color={colors.primary} />
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>{plan.currency}</Text>
          <Text style={styles.price}>{plan.price}</Text>
          <Text style={styles.interval}>{plan.interval}</Text>
        </View>

        {plan.savings && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>{plan.savings}</Text>
          </View>
        )}

        <Text style={styles.planDescription}>{plan.description}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map(renderFeature)}
      </View>

      <TouchableOpacity
        style={[
          styles.planButton,
          plan.highlight ? styles.primaryButton : styles.secondaryButton,
        ]}
        onPress={() => handleSelectPlan(plan)}
      >
        <Text
          style={[
            styles.buttonText,
            plan.highlight ? styles.primaryButtonText : styles.secondaryButtonText,
          ]}
        >
          Choose {plan.name} Plan
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pricing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Simple, Transparent Pricing</Text>
          <Text style={styles.subtitle}>
            Choose the plan that works best for you. All plans include access to our complete AI platform.
          </Text>
        </View>

        {user && (
          <View style={styles.userCard}>
            <Text style={styles.currentPlan}>Current Plan: {user.isPremium ? 'Premium' : 'Free'}</Text>
            <Text style={styles.creditsInfo}>Credits: {user.credits}</Text>
          </View>
        )}

        <View style={styles.plansContainer}>
          {pricingPlans.map(renderPlanCard)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All plans include access to 20+ AI models, conversation history, and priority support.
          </Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
  },
  userCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  currentPlan: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.accentForeground,
  },
  creditsInfo: {
    fontSize: fontSize.sm,
    color: colors.accentForeground,
    marginTop: spacing.xs,
  },
  plansContainer: {
    paddingHorizontal: spacing.lg,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    position: 'relative',
  },
  highlightedPlan: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -60 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  popularText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: colors.primaryForeground,
    marginLeft: spacing.xs,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  planName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  currency: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  price: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  interval: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginLeft: spacing.xs,
  },
  savingsBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  savingsText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  planDescription: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.foreground,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },
  planButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: colors.primaryForeground,
  },
  secondaryButtonText: {
    color: colors.foreground,
  },
});

