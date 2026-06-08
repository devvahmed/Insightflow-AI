import { Animated, Easing } from 'react-native';

export const fadeIn = (anim: Animated.Value, delay = 0, duration = 400) =>
  Animated.timing(anim, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });

export const slideUp = (anim: Animated.Value, delay = 0, duration = 450) =>
  Animated.timing(anim, {
    toValue: 0,
    duration,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });

export const slideDown = (anim: Animated.Value, delay = 0, duration = 500) =>
  Animated.timing(anim, {
    toValue: 0,
    duration,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });

export const slideInLeft = (anim: Animated.Value, delay = 0, duration = 400) =>
  Animated.timing(anim, {
    toValue: 0,
    duration,
    delay,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });

export const scaleIn = (anim: Animated.Value, delay = 0) =>
  Animated.spring(anim, {
    toValue: 1,
    delay,
    useNativeDriver: true,
    damping: 15,
    stiffness: 150,
  });

export const staggered = (anims: Animated.Value[], staggerMs = 80) =>
  Animated.stagger(
    staggerMs,
    anims.map((a, i) => fadeIn(a, i * staggerMs))
  );

export const runEntrance = (
  opacity: Animated.Value,
  translateY: Animated.Value,
  delay = 0
) => {
  opacity.setValue(0);
  translateY.setValue(24);
  Animated.parallel([fadeIn(opacity, delay), slideUp(translateY, delay)]).start();
};
