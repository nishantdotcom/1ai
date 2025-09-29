import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

export const ThinkingAnimation: React.FC = () => {
  const { colors } = useTheme();
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation = Animated.stagger(200, [
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 0),
      createDotAnimation(dot3Anim, 0),
    ]);

    animation.start();

    return () => animation.stop();
  }, [dot1Anim, dot2Anim, dot3Anim]);

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot1Anim,
            transform: [
              {
                scale: dot1Anim.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot2Anim,
            transform: [
              {
                scale: dot2Anim.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot3Anim,
            transform: [
              {
                scale: dot3Anim.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mutedForeground,
    marginHorizontal: 2,
  },
});