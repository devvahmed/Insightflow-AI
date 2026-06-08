import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { scaleIn } from '../../utils/animations';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const PrimaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) => {
  const T = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 150,
    }).start();
  };

  React.useEffect(() => {
    scale.setValue(0.92);
    scaleIn(scale, 0).start();
  }, []);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[
          styles.btn,
          T.shadow,
          {
            backgroundColor: T.primary,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={T.primaryText} />
        ) : (
          <Text style={[styles.label, { color: T.primaryText }]}>{label}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
