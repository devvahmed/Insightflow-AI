import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../theme/useTheme';
import { loginApi, signupApi } from '../api/api';
import { APP_DEFAULTS } from '../constants/mockData';
import { useSignupForm } from '../hooks/useSignupForm';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SecondaryButton } from '../components/ui/SecondaryButton';
import { SpotlightModal } from '../components/modals/SpotlightModal';
import { fadeIn, slideUp, scaleIn } from '../utils/animations';
import { BrandAvatar } from '../components/BrandLogo';
import {
  AuthInput,
  Step1Bio,
  Step2Brand,
  Step3Social,
  Step4Review,
} from './auth/SignupSteps';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STEP_LABELS = ['Bio', 'Brand', 'Social', 'Confirm'];

export const AuthScreen = () => {
  const T = useTheme();
  const setAuth = useUserStore((s) => s.setAuth);
  const login = useUserStore((s) => s.login);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState(1);

  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleLaunchDemo = (type: 'retail' | 'fintech') => {
    setShowDemoModal(false);
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
  };
  const [loading, setLoading] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { form, update, updateSocial } = useSignupForm();

  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const glassY = useRef(new Animated.Value(50)).current;
  const glassOpacity = useRef(new Animated.Value(0)).current;
  const tabIndicator = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const formFade = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const loginInputAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  const tabW = (SCREEN_WIDTH - 56 - 8) / 2;

  useEffect(() => {
    logoScale.setValue(0.9);
    Animated.parallel([
      fadeIn(logoOpacity, 0, 500),
      scaleIn(logoScale, 0),
    ]).start();
    fadeIn(titleOpacity, 150).start();
    fadeIn(tagOpacity, 250).start();
    glassY.setValue(50);
    Animated.parallel([slideUp(glassY, 200, 500), fadeIn(glassOpacity, 200, 500)]).start();
  }, []);

  useEffect(() => {
    Animated.spring(tabIndicator, {
      toValue: mode === 'login' ? 0 : 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
    }).start();
    if (mode === 'login') {
      loginInputAnims.forEach((a, i) => fadeIn(a, 350 + i * 60).start());
    }
  }, [mode]);

  useEffect(() => {
    const pct = ((signupStep - 1) / 3) * 100;
    Animated.timing(progressWidth, {
      toValue: pct,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [signupStep]);

  useEffect(() => {
    if (!signupSuccess) return;
    scaleIn(successScale, 0).start();
  }, [signupSuccess]);

  const tabX = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 4 + tabW],
  });

  const transitionStep = (next: number, direction: 'left' | 'right') => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: direction === 'left' ? -30 : 30,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(formFade, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSignupStep(next);
      slideAnim.setValue(direction === 'left' ? 30 : -30);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(formFade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const sandboxLogin = () => {
    setAuth('sandbox-demo-token', {
      email: form.email || email,
      brand_name: form.brandName || 'Demo Brand',
      full_name: form.fullName || 'Demo User',
      website_url: form.websiteUrl || 'https://example.com',
      primaryColor: APP_DEFAULTS.brandPrimaryColor,
      secondaryColor: APP_DEFAULTS.brandSecondaryColor,
      slogan: 'Trendy retail brand persona.',
      industry: form.industry || 'Fashion & Apparel',
      logo_path: form.logoUri || '',
      brandKeywords: [],
      socialHandles: {},
      analyses: [],
      campaigns: [],
    });
    setShowSandbox(false);
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setAuthError('');
    try {
      const result = await loginApi(email, password);
      setAuth(result.token, result.user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setAuthError(message);
      const isNetwork = message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch');
      if (isNetwork) setShowSandbox(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!form.email || !form.password || !form.fullName || !form.brandName) {
      setAuthError('Please fill in name, email, password, and brand name.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      const result = await signupApi({
        email: form.email,
        password: form.password,
        full_name: form.fullName,
        brand_name: form.brandName,
        industry: form.industry,
        website_url: form.websiteUrl,
        social_instagram: form.socialHandles.instagram || '',
        social_tiktok: form.socialHandles.tiktok || '',
        social_facebook: form.socialHandles.facebook || '',
        logo: form.logoUri ? { uri: form.logoUri } : null,
      });
      setAuth(result.token, result.user);
      Animated.timing(formFade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
        setSignupSuccess(true)
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      setAuthError(message);
      const isNetwork = message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch');
      if (isNetwork) setShowSandbox(true);
    } finally {
      setLoading(false);
    }
  };

  const progressFillWidth = progressWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />
      {/* ── DEMO ACCOUNT BUTTON ── */}
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

      <View style={styles.topSection}>
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT * 0.4} style={StyleSheet.absoluteFillObject}>
          <Defs>
            <RadialGradient id="authGlow" cx="50%" cy="35%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={T.accent} stopOpacity={0.2} />
              <Stop offset="70%" stopColor={T.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#authGlow)" />
        </Svg>
        <Animated.Image
          source={APP_DEFAULTS.appLogo}
          style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
          resizeMode="contain"
        />
        <Animated.View style={[styles.titleRow, { opacity: titleOpacity }]}>
          <Text style={[styles.titleLight, { color: T.text }]}>InsightFlow</Text>
          <Text style={[styles.titleBold, { color: T.text }]}> AI</Text>
        </Animated.View>
        <Animated.Text style={[styles.tagline, { color: T.textSecondary, opacity: tagOpacity }]}>
          Growth & Marketing Intelligence Suite
        </Animated.Text>
      </View>

      <Animated.View
        style={[
          styles.glassCard,
          T.glassCard,
          {
            opacity: glassOpacity,
            transform: [{ translateY: glassY }],
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.glassScroll}
          >
            <View style={[styles.tabPillWrap, { backgroundColor: T.btnSecondary }]}>
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {
                    width: tabW,
                    backgroundColor: T.isDarkMode ? T.surface : T.card,
                    transform: [{ translateX: tabX }],
                  },
                  T.shadow,
                ]}
              />
              {(['login', 'signup'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.tabBtn}
                  onPress={() => {
                    setMode(m);
                    if (m === 'signup') setSignupStep(1);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: mode === m ? T.text : T.textSecondary,
                    }}
                  >
                    {m === 'login' ? 'Login' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {mode === 'login' ? (
              <View>
                <Animated.View style={{ opacity: loginInputAnims[0] }}>
                  <AuthInput
                    T={T}
                    icon="mail"
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                </Animated.View>
                <Animated.View style={{ opacity: loginInputAnims[1] }}>
                  <AuthInput
                    T={T}
                    icon="lock"
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secure={!showPassword}
                    showToggle
                    onToggleSecure={() => setShowPassword(!showPassword)}
                  />
                </Animated.View>
                <TouchableOpacity style={styles.forgotWrap}>
                  <Text style={[styles.forgot, { color: T.accent }]}>Forgot Password?</Text>
                </TouchableOpacity>
                {authError ? (
                  <Text style={{ color: T.error, fontSize: 13, marginTop: 8 }}>{authError}</Text>
                ) : null}
                <Animated.View style={{ opacity: loginInputAnims[2] }}>
                  <PrimaryButton label="Sign In" onPress={handleLogin} loading={loading} style={{ marginTop: 24 }} />
                </Animated.View>
                <View style={styles.orRow}>
                  <View style={[styles.orLine, { backgroundColor: T.divider }]} />
                  <Text style={[styles.orText, { color: T.textMuted }]}>OR</Text>
                  <View style={[styles.orLine, { backgroundColor: T.divider }]} />
                </View>
                <View style={styles.socialLoginRow}>
                  <SecondaryButton label="Google" onPress={() => {}} style={styles.socialBtn} />
                  <SecondaryButton label="Apple" onPress={() => {}} style={styles.socialBtn} />
                </View>
              </View>
            ) : signupSuccess ? (
              <View style={styles.successWrap}>
                <Animated.View style={{ transform: [{ scale: successScale }] }}>
                  <Feather name="check-circle" size={64} color={T.accent} />
                </Animated.View>
                <Text style={[styles.successTitle, { color: T.text }]}>Account Created!</Text>
                <Text style={[styles.successSub, { color: T.textSecondary }]}>
                  Redirecting to dashboard...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.progressWrap}>
                  <View style={styles.progressDots}>
                    {STEP_LABELS.map((label, i) => {
                      const stepNum = i + 1;
                      const done = signupStep > stepNum;
                      const active = signupStep === stepNum;
                      return (
                        <View key={label} style={styles.stepCol}>
                          <View
                            style={[
                              styles.stepDot,
                              {
                                backgroundColor: done || active ? T.btnPrimary : T.btnSecondary,
                              },
                              active && T.shadow,
                            ]}
                          >
                            {done ? (
                              <Feather name="check" size={13} color={T.btnPrimaryText} />
                            ) : (
                              <Text
                                style={{
                                  color: active ? T.btnPrimaryText : T.textMuted,
                                  fontSize: 12,
                                  fontWeight: '700',
                                }}
                              >
                                {stepNum}
                              </Text>
                            )}
                          </View>
                          <Text style={[styles.stepLabel, { color: T.textSecondary }]}>{label}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <View style={[styles.progressLineBg, { backgroundColor: T.divider }]}>
                    <Animated.View
                      style={[
                        styles.progressLineFill,
                        { backgroundColor: T.btnPrimary, width: progressFillWidth },
                      ]}
                    />
                  </View>
                </View>
                {authError && mode === 'signup' ? (
                  <Text style={{ color: T.error, fontSize: 13, marginBottom: 12 }}>{authError}</Text>
                ) : null}
                <Animated.View
                  style={{
                    opacity: formFade,
                    transform: [{ translateX: slideAnim }],
                  }}
                >
                  {signupStep === 1 && (
                    <Step1Bio
                      form={form}
                      update={update}
                      onNext={() => transitionStep(2, 'left')}
                    />
                  )}
                  {signupStep === 2 && (
                    <Step2Brand
                      form={form}
                      update={update}
                      onBack={() => transitionStep(1, 'right')}
                      onNext={() => transitionStep(3, 'left')}
                    />
                  )}
                  {signupStep === 3 && (
                    <Step3Social
                      form={form}
                      updateSocial={updateSocial}
                      onBack={() => transitionStep(2, 'right')}
                      onNext={() => transitionStep(4, 'left')}
                    />
                  )}
                  {signupStep === 4 && (
                    <Step4Review
                      form={form}
                      update={update}
                      onBack={() => transitionStep(3, 'right')}
                      onSubmit={handleSignup}
                      loading={loading}
                      goStep={(n) => transitionStep(n, 'right')}
                      onOpenTerms={() => setShowTermsModal(true)}
                    />
                  )}
                </Animated.View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>

      <SpotlightModal visible={showSandbox} onClose={() => setShowSandbox(false)} scroll={false}>
        <View style={styles.sandboxInner}>
        <Text style={[styles.sandboxTitle, { color: T.text }]}>Backend Unavailable</Text>
        <Text style={[styles.sandboxBody, { color: T.textSecondary }]}>
          Continue in Sandbox mode to preview the full campaign pipeline offline.
        </Text>
        <PrimaryButton label="Continue in Sandbox" onPress={sandboxLogin} />
        <TouchableOpacity onPress={() => setShowSandbox(false)} style={{ marginTop: 12 }}>
          <Text style={{ color: T.textMuted, textAlign: 'center' }}>Cancel</Text>
        </TouchableOpacity>
        </View>
      </SpotlightModal>

      <SpotlightModal visible={showTermsModal} onClose={() => setShowTermsModal(false)} scroll={true}>
        <View style={styles.termsModalInner}>
          <View style={styles.termsModalHeader}>
            <View style={[styles.termsIconBox, { backgroundColor: T.accent + '22' }]}>
              <Feather name="shield" size={28} color={T.accent} />
            </View>
            <Text style={[styles.termsModalTitle, { color: T.text }]}>Terms & Conditions</Text>
            <Text style={[styles.termsModalSubtitle, { color: T.textSecondary }]}>InsightFlow AI Workspace Agreement</Text>
          </View>

          <View style={[styles.termsGlowDivider, { backgroundColor: T.accent }]} />

          <View style={styles.termsScrollContent}>
            <Text style={[styles.termsIntroText, { color: T.textSecondary }]}>
              Welcome to the future of automated marketing intelligence. By utilizing the InsightFlow AI Campaign suite, you agree to comply with and be bound by the following protocols:
            </Text>

            <View style={[styles.termsSectionCard, { backgroundColor: T.surface, borderColor: T.border }]}>
              <View style={styles.sectionHeadingRow}>
                <Feather name="cpu" size={16} color={T.accent} />
                <Text style={[styles.sectionHeading, { color: T.text }]}>1. Strategic Optimization Protocols</Text>
              </View>
              <Text style={[styles.sectionBody, { color: T.textSecondary }]}>
                Our multi-agent consensus system generates ad scripts, marketing suggestions, and automated visual assets based on deep neural network computation. Always review creatives before publication.
              </Text>
            </View>

            <View style={[styles.termsSectionCard, { backgroundColor: T.surface, borderColor: T.border }]}>
              <View style={styles.sectionHeadingRow}>
                <Feather name="database" size={16} color={T.accent} />
                <Text style={[styles.sectionHeading, { color: T.text }]}>2. Data Integrity & Scraping</Text>
              </View>
              <Text style={[styles.sectionBody, { color: T.textSecondary }]}>
                InsightFlow gathers competitive signals, brand DNA markers, and sales statistics to construct high-credibility growth models. You assert all provided business URLs and spreadsheets represent valid records.
              </Text>
            </View>

            <View style={[styles.termsSectionCard, { backgroundColor: T.surface, borderColor: T.border }]}>
              <View style={styles.sectionHeadingRow}>
                <Feather name="share-2" size={16} color={T.accent} />
                <Text style={[styles.sectionHeading, { color: T.text }]}>3. Security & Cloud Syncing</Text>
              </View>
              <Text style={[styles.sectionBody, { color: T.textSecondary }]}>
                Your connected social handles are kept safe and local. Dispatched campaigns, emails, and traces use encrypted tokens to communicate securely with target platforms.
              </Text>
            </View>
          </View>

          <View style={styles.termsFooterButtons}>
            <PrimaryButton 
              label="Accept & Agree" 
              onPress={() => {
                update('termsAccepted', true);
                setShowTermsModal(false);
              }}
              style={[T.shadowStrong, { shadowColor: T.accent, shadowOpacity: 0.3 }]}
            />
            <TouchableOpacity onPress={() => setShowTermsModal(false)} style={styles.termsModalCloseBtn}>
              <Text style={{ color: T.textMuted, fontWeight: '600', textAlign: 'center' }}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SpotlightModal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  topSection: {
    height: '38%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  },
  logo: { width: 90, height: 90, marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline' },
  titleLight: { fontSize: 30, fontWeight: '300' },
  titleBold: { fontSize: 30, fontWeight: '800' },
  tagline: { fontSize: 13, textAlign: 'center', marginTop: 6 },
  glassCard: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
  },
  glassScroll: { paddingBottom: 40 },
  tabPillWrap: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    marginBottom: 20,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 0,
    height: 40,
    borderRadius: 999,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    zIndex: 1,
  },
  forgotWrap: { alignItems: 'flex-end', marginTop: 4 },
  forgot: { fontSize: 12 },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 12 },
  socialLoginRow: { flexDirection: 'row', gap: 10 },
  socialBtn: { flex: 1 },
  progressWrap: { marginBottom: 24 },
  progressDots: { flexDirection: 'row', justifyContent: 'space-between' },
  stepCol: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: { fontSize: 10, marginTop: 6 },
  progressLineBg: {
    height: 2,
    marginTop: 12,
    marginHorizontal: 20,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressLineFill: { height: '100%' },
  successWrap: { alignItems: 'center', paddingVertical: 48 },
  successTitle: { fontSize: 24, fontWeight: '800', marginTop: 16 },
  successSub: { fontSize: 14, marginTop: 8 },
  sandboxInner: { padding: 24 },
  sandboxTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  sandboxBody: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  termsModalInner: { paddingVertical: 12 },
  termsModalHeader: { alignItems: 'center', marginBottom: 16 },
  termsIconBox: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  termsModalTitle: { fontSize: 22, fontWeight: '800' },
  termsModalSubtitle: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  termsGlowDivider: { height: 2.5, width: 80, alignSelf: 'center', borderRadius: 99, opacity: 0.8, marginBottom: 16 },
  termsScrollContent: { gap: 12, marginBottom: 20 },
  termsIntroText: { fontSize: 13, lineHeight: 18, textAlign: 'center', marginBottom: 10, paddingHorizontal: 6 },
  termsSectionCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sectionHeading: { fontSize: 14, fontWeight: '700' },
  sectionBody: { fontSize: 12, lineHeight: 16 },
  termsFooterButtons: { gap: 12, marginTop: 8 },
  termsModalCloseBtn: { paddingVertical: 12 },
});
