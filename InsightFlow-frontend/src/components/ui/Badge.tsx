import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface BadgeProps {
  label: string;
  color?: string;
}

export const Badge = ({ label, color }: BadgeProps) => {
  const T = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color ?? T.accentSecondary,
          borderRadius: T.radius.full,
        },
      ]}
    >
      <Text style={[styles.label, { color: T.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
