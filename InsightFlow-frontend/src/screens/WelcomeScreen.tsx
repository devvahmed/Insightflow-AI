import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  Image,
  Easing,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useTheme, Theme } from '../theme/useTheme';
import { APP_DEFAULTS } from '../constants/mockData';
import { useUserStore } from '../store/userStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FLOATING_ICONS = [
  { lib: Feather, name: 'bar-chart-2', delay: 0, x: 10, y: 14, size: 22 },
  { lib: MaterialCommunityIcons, name: 'brain', delay: 400, x: 82, y: 10, size: 24 },
  { lib: Feather, name: 'target', delay: 800, x: 8, y: 72, size: 20 },
  { lib: Ionicons, name: 'send-outline', delay: 1200, x: 84, y: 68, size: 22 },
  { lib: Feather, name: 'trending-up', delay: 1600, x: 78, y: 38, size: 20 },
] as const;

const LOADING_DURATION_MS = 1800;
const LOADING_STATUS = 'Preparing your workspace…';

interface WelcomeScreenProps {
  onContinue: () => void;
}

function createThemedStyles(T: Theme) {
  return {
    accentGlowCenter: { stopColor: T.accent, stopOpacity: 0.15 },
    accentGlowEdge: { stopColor: T.accent, stopOpacity: 0 },
    secondaryGlowCenter: { stopColor: T.accentSecondary, stopOpacity: 0.12 },
    secondaryGlowEdge: { stopColor: T.accentSecondary, stopOpacity: 0 },
    floatingIconActive: {
      backgroundColor: T.withAlpha(T.accent, 0.12),
      borderColor: T.withAlpha(T.accent, 0.28),
    },
    floatingIconIdle: {
      backgroundColor: T.glass.backgroundColor,
      borderColor: T.glass.borderColor,
    },
    ctaLabel: { color: T.onAccent },
    progressTrack: { backgroundColor: T.withAlpha(T.text, 0.08) },
    progressFill: {
      backgroundColor: T.accent,
      shadowColor: T.accent,
    },
  };
}

export const WelcomeScreen = ({ onContinue }: WelcomeScreenProps) => {
  const T = useTheme();
  const themed = useMemo(() => createThemedStyles(T), [T]);

  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pulseIndex, setPulseIndex] = useState(0);

  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleLaunchDemo = (type: 'retail' | 'fintech') => {
    setShowDemoModal(false);
    
    const setAuth = useUserStore.getState().setAuth;
    if (type === 'retail') {
      setAuth('demo-retail-token', {
        email: 'demo-retail@insightflow-ai.tech',
        brand_name: 'Shell Pakistan',
        full_name: 'Shell Demo Account',
        website_url: 'https://shell.com.pk/',
        primaryColor: '#e00000',
        secondaryColor: '#e0c000',
        slogan: 'Go further, go premium.',
        industry: 'Automotive & Vehicles',
        logo_path: '/uploads/47cd222a-ddfa-420d-b5ed-d4444e546dfb.png',
        logo_url: 'http://localhost:8000/uploads/47cd222a-ddfa-420d-b5ed-d4444e546dfb.png',
        brandKeywords: ['Fuel', 'Lubricants', 'Premium Service'],
        socialHandles: {
          instagram: '@shellpakistan',
          tiktok: '@shellpakistan',
          facebook: '@shellpakistan',
        },
        analyses: [],
        campaigns: [],
      });
    } else {
      setAuth('demo-fintech-token', {
        email: 'demo-fintech@insightflow-ai.tech',
        brand_name: 'HBL Pakistan',
        full_name: 'HBL Demo Account',
        website_url: 'https://hbl.com/',
        primaryColor: '#005B5C',
        secondaryColor: '#C5A059',
        slogan: 'Jahan Khwab, Wahan HBL.',
        industry: 'Finance, Banking & FinTech',
        logo_path: '/uploads/hbl_logo.png',
        logo_url: 'http://localhost:8000/uploads/hbl_logo.png',
        brandKeywords: ['Mobile Banking', 'Savings', 'Biometric Payments'],
        socialHandles: {
          instagram: '@hblpakistan',
          tiktok: '@hblpakistan',
          facebook: '@hblpakistan',
        },
        analyses: [],
        campaigns: [],
      });
    }
    onContinue();
  };

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  const floatAnims = useRef(
    FLOATING_ICONS.map(() => new Animated.Value(0))
  ).current;

  const handleStart = () => {
    setHasStarted(true);
    Animated.timing(contentOpacity, {
      toValue: 0.3,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.timing(progressWidth, {
      toValue: 1,
      duration: LOADING_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  // Floating icon Y-drift loops
  useEffect(() => {
    if (hasStarted) return;

    const loops = floatAnims.map((anim, idx) => {
      const duration = 2000 + (idx % 3) * 400;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            delay: FLOATING_ICONS[idx].delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      );
    });

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [hasStarted, floatAnims]);

  // Pulse rotation for active icon
  useEffect(() => {
    if (hasStarted) return;
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % FLOATING_ICONS.length);
    }, 800);
    return () => clearInterval(interval);
  }, [hasStarted]);

  // Progress percentage tracker during loading
  useEffect(() => {
    if (!hasStarted) return;

    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / LOADING_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(tick);
    }, 50);

    return () => clearInterval(tick);
  }, [hasStarted]);

  // Fade out and navigate when loading completes
  useEffect(() => {
    if (!hasStarted || progress < 100) return;

    const timeout = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onContinue());
    }, 200);

    return () => clearTimeout(timeout);
  }, [hasStarted, progress, onContinue, screenOpacity]);

  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[styles.root, { backgroundColor: T.bg, opacity: screenOpacity }]}
    >
      {/* ── DEMO ACCOUNT BUTTON ── */}
      {!hasStarted && (
        <TouchableOpacity
          onPress={() => setShowDemoModal(true)}
          activeOpacity={0.8}
          style={[
            styles.demoBtn,
            T.glass,
            {
              borderColor: T.withAlpha(T.accent, 0.4),
              backgroundColor: T.withAlpha(T.accent, 0.12),
            },
          ]}
        >
          <Feather name="briefcase" size={14} color={T.accent} />
          <Text style={[styles.demoBtnText, { color: T.accent }]}>Demo Account</Text>
        </TouchableOpacity>
      )}

      {/* ── DEMO SELECTOR MODAL ── */}
      <Modal visible={showDemoModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, T.glassCard, { borderColor: T.border }]}>
            <View style={styles.modalHeader}>
              <Feather name="layers" size={24} color={T.accent} />
              <Text style={[styles.modalTitle, { color: T.text }]}>Select Demo Scenario</Text>
            </View>
            <Text style={[styles.modalSub, { color: T.textSecondary }]}>
              Choose a pre-filled business profile to experience the campaign strategy, creative asset preview, and email outreach pipeline.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: SCREEN_HEIGHT * 0.55 }}>
              {/* Option A: Shell (Retail & E-Commerce) */}
              <TouchableOpacity
                onPress={() => handleLaunchDemo('retail')}
                activeOpacity={0.85}
                style={[
                  styles.optionCard,
                  { borderColor: '#e00000' + '40', backgroundColor: T.withAlpha(T.card, 0.6) },
                ]}
              >
                <View style={styles.optionHead}>
                  <View style={[styles.optionIconBox, { backgroundColor: '#e00000' + '15' }]}>
                    <Feather name="shopping-bag" size={22} color="#e00000" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, { color: T.text }]}>Shell Retail & E-Commerce</Text>
                    <Text style={[styles.optionDomain, { color: T.textMuted }]}>Retail, Fashion & E-Commerce Niche</Text>
                  </View>
                </View>
                <Text style={[styles.optionDesc, { color: T.textSecondary }]}>
                  Analyzes Daraz & eBay reviews, warehouse overstocking of 14.2K units, and optimizes a 55,000 PKR monthly marketing campaign.
                </Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.miniBadge, { backgroundColor: '#e00000' + '12' }]}>
                    <Text style={{ color: '#e00000', fontSize: 10, fontWeight: '700' }}>PKR 55,000</Text>
                  </View>
                  <View style={[styles.miniBadge, { backgroundColor: T.divider }]}>
                    <Text style={{ color: T.textSecondary, fontSize: 10, fontWeight: '700' }}>14,200 Stock</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Option B: HBL (FinTech & Banking) */}
              <TouchableOpacity
                onPress={() => handleLaunchDemo('fintech')}
                activeOpacity={0.85}
                style={[
                  styles.optionCard,
                  { borderColor: '#005B5C' + '40', backgroundColor: T.withAlpha(T.card, 0.6) },
                ]}
              >
                <View style={styles.optionHead}>
                  <View style={[styles.optionIconBox, { backgroundColor: '#005B5C' + '15' }]}>
                    <Feather name="credit-card" size={22} color="#005B5C" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, { color: T.text }]}>HBL FinTech & Digital Banking</Text>
                    <Text style={[styles.optionDomain, { color: T.textMuted }]}>Finance, Banking & Tech Niche</Text>
                  </View>
                </View>
                <Text style={[styles.optionDesc, { color: T.textSecondary }]}>
                  Audit biometric logins, fund transfer timeouts, student vouchers, and dynamically syncs a 750,000 PKR digital campaign budget.
                </Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.miniBadge, { backgroundColor: '#005B5C' + '12' }]}>
                    <Text style={{ color: '#005B5C', fontSize: 10, fontWeight: '700' }}>PKR 750,000</Text>
                  </View>
                  <View style={[styles.miniBadge, { backgroundColor: T.divider }]}>
                    <Text style={{ color: T.textSecondary, fontSize: 10, fontWeight: '700' }}>24,500 Cards</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowDemoModal(false)}
              style={[styles.closeBtn, { backgroundColor: T.btnSecondary }]}
            >
              <Text style={{ color: T.text, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <StatusBar
        barStyle={T.isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={T.bg}
      />

      {/* Primary accent radial glow */}
      <Svg style={StyleSheet.absoluteFillObject} width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
        <Defs>
          <RadialGradient
            id="accentGlow"
            cx="50%"
            cy="38%"
            rx="55%"
            ry="45%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" {...themed.accentGlowCenter} />
            <Stop offset="100%" {...themed.accentGlowEdge} />
          </RadialGradient>
          <RadialGradient
            id="secondaryGlow"
            cx="50%"
            cy="92%"
            rx="60%"
            ry="35%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" {...themed.secondaryGlowCenter} />
            <Stop offset="100%" {...themed.secondaryGlowEdge} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#accentGlow)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#secondaryGlow)" />
      </Svg>

      {/* Floating marketing icons */}
      {!hasStarted && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {FLOATING_ICONS.map((item, index) => {
            const isActive = pulseIndex === index;
            const translateY = floatAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, -14 - (index % 2) * 6],
            });
            const IconLib = item.lib;

            return (
              <Animated.View
                key={index}
                style={[
                  styles.floatingIcon,
                  {
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    borderRadius: T.glass.borderRadius,
                    transform: [{ translateY }, { scale: isActive ? 1.2 : 1 }],
                  },
                  isActive ? themed.floatingIconActive : themed.floatingIconIdle,
                ]}
              >
                <IconLib
                  name={item.name as never}
                  size={item.size}
                  color={isActive ? T.accent : T.textSecondary}
                />
              </Animated.View>
            );
          })}
        </View>
      )}

      <Animated.View
        style={[styles.content, { opacity: hasStarted ? contentOpacity : 1 }]}
      >
        <Image
          source={APP_DEFAULTS.appLogo}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.titleRow}>
          <Text style={[styles.titleLight, { color: T.text }]}>InsightFlow</Text>
          <Text style={[styles.titleBold, { color: T.text }]}> AI</Text>
        </View>

        <Text style={[styles.subtitle, { color: T.textSecondary }]}>
          {APP_DEFAULTS.brandSlogan}
        </Text>

        {!hasStarted ? (
          <TouchableOpacity
            onPress={handleStart}
            activeOpacity={0.85}
            style={[
              styles.cta,
              T.shadow,
              {
                backgroundColor: T.accent,
                shadowColor: T.accent,
              },
            ]}
          >
            <Ionicons name="arrow-forward" size={18} color={T.onAccent} />
            <Text style={[styles.ctaLabel, themed.ctaLabel]}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.loadingBlock}>
            <Text style={[styles.loadingStatus, { color: T.textSecondary }]}>
              {LOADING_STATUS}
            </Text>
            <View style={[styles.progressTrack, themed.progressTrack]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  themed.progressFill,
                  { width: progressBarWidth },
                ]}
              />
            </View>
            <Text style={[styles.progressPct, { color: T.textSecondary }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  titleLight: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  titleBold: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
    paddingHorizontal: 12,
    maxWidth: 320,
  },
  floatingIcon: {
    position: 'absolute',
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  ctaLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingBlock: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    marginTop: 24,
  },
  loadingStatus: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  progressTrack: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },
  demoBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    zIndex: 100,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  optionCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  optionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  optionDomain: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});
