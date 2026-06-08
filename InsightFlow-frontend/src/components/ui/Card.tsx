import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { fadeIn, slideUp } from '../../utils/animations';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
  delay?: number;
}

export const Card = ({ children, style, animated = false, delay = 0 }: CardProps) => {
  const T = useTheme();
  const opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animated ? 24 : 0)).current;

  useEffect(() => {
    if (!animated) return;
    opacity.setValue(0);
    translateY.setValue(24);
    Animated.parallel([fadeIn(opacity, delay), slideUp(translateY, delay)]).start();
  }, [animated, delay, opacity, translateY]);

  const content = (
    <View
      style={[
        styles.card,
        T.shadow,
        {
          backgroundColor: T.card,
          borderColor: T.border,
          borderRadius: T.radius.xl,
          padding: T.spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!animated) return content;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {content}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
