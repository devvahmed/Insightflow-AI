import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { fadeIn } from '../../utils/animations';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
  const T = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeIn(opacity, 0).start();
  }, [opacity]);

  return (
    <Animated.View style={[styles.wrap, { opacity }]}>
      <Text style={[styles.title, { color: T.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: T.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
