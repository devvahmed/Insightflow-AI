import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, Theme } from '../../theme/useTheme';
import { SignupFormData } from '../../hooks/useSignupForm';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { Card } from '../../components/ui/Card';
import { SpotlightModal } from '../../components/modals/SpotlightModal';

const SEM = { error: '#EF4444', success: '#22C55E' };

const INDUSTRIES = [
  'E-Commerce & Retail',
  'Fashion & Apparel',
  'Food & Beverage',
  'Electronics & Gadgets',
  'Automotive & Vehicles',
  'Beauty & Personal Care',
  'Home, Furniture & Living',
  'SaaS & Software Technology',
  'Healthcare & Pharmaceuticals',
  'Real Estate & Construction',
  'Education & EdTech',
  'Entertainment & Media',
  'Finance, Banking & FinTech',
  'Sports & Fitness',
  'Travel, Tourism & Hospitality',
  'Logistics & Supply Chain',
  'Agriculture & Farming',
  'Professional Services (Consulting/Agency)',
  'Other Services',
];

const PLATFORMS = [
  { id: 'facebook' as const, name: 'Facebook', color: '#1877F2', icon: 'logo-facebook' },
  { id: 'instagram' as const, name: 'Instagram', color: '#E1306C', icon: 'logo-instagram' },
  { id: 'tiktok' as const, name: 'TikTok', color: '#000000', icon: 'logo-tiktok' },
  { id: 'linkedin' as const, name: 'LinkedIn', color: '#0077B5', icon: 'logo-linkedin' },
];

type FieldKey = keyof Pick<SignupFormData, 'fullName' | 'email' | 'password' | 'confirmPassword' | 'brandName' | 'websiteUrl' | 'industry'>;

export function AuthInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secure,
  showToggle,
  onToggleSecure,
  keyboardType,
  focused,
  onFocus,
  onBlur,
  valid,
  error,
  T,
}: {
  icon: keyof typeof Feather.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  showToggle?: boolean;
  onToggleSecure?: () => void;
  keyboardType?: 'default' | 'email-address' | 'url';
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  valid?: boolean | null;
  error?: string;
  T: Theme;
}) {
  const borderColor =
    error ? SEM.error : valid ? SEM.success : focused ? T.accent : T.glassInput.borderColor;

  return (
    <View style={styles.inputBlock}>
      <View
        style={[
          styles.inputWrap,
          T.glassInput,
          { borderColor, backgroundColor: T.glassInput.backgroundColor },
        ]}
      >
        <Feather name={icon} size={18} color={T.textMuted} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: T.text }]}
          placeholder={placeholder}
          placeholderTextColor={T.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {showToggle ? (
          <TouchableOpacity onPress={onToggleSecure}>
            <Feather name={secure ? 'eye-off' : 'eye'} size={18} color={T.textMuted} />
          </TouchableOpacity>
        ) : null}
        {valid === true ? <Feather name="check-circle" size={18} color={SEM.success} /> : null}
        {valid === false ? <Feather name="alert-circle" size={18} color={SEM.error} /> : null}
      </View>
      {error ? <Text style={[styles.errText, { color: SEM.error }]}>{error}</Text> : null}
    </View>
  );
}

export function Step1Bio({
  form,
  update,
  onNext,
}: {
  form: SignupFormData;
  update: (k: keyof SignupFormData, v: SignupFormData[keyof SignupFormData]) => void;
  onNext: () => void;
}) {
  const T = useTheme();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const passOk = form.password.length >= 6;
  const confirmOk = form.password === form.confirmPassword && form.confirmPassword.length > 0;
  const nameOk = form.fullName.trim().length >= 2;
  const valid = nameOk && emailOk && passOk && confirmOk;

  return (
    <View>
      <Text style={[styles.stepTitle, { color: T.text }]}>Tell us about you</Text>
      <Text style={[styles.stepSub, { color: T.textSecondary }]}>Your account details</Text>
      <AuthInput
        T={T}
        icon="user"
        placeholder="Full Name"
        value={form.fullName}
        onChangeText={(t) => update('fullName', t)}
        onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
        valid={touched.fullName ? nameOk : null}
        error={touched.fullName && !nameOk ? 'Enter your full name' : undefined}
      />
      <AuthInput
        T={T}
        icon="mail"
        placeholder="Email Address"
        value={form.email}
        onChangeText={(t) => update('email', t)}
        keyboardType="email-address"
        onBlur={() => setTouched((p) => ({ ...p, email: true }))}
        valid={touched.email ? emailOk : null}
        error={touched.email && !emailOk ? 'Enter a valid email' : undefined}
      />
      <AuthInput
        T={T}
        icon="lock"
        placeholder="Password"
        value={form.password}
        onChangeText={(t) => update('password', t)}
        secure={!showPass}
        showToggle
        onToggleSecure={() => setShowPass(!showPass)}
        onBlur={() => setTouched((p) => ({ ...p, password: true }))}
        valid={touched.password ? passOk : null}
        error={touched.password && !passOk ? 'Min 6 characters' : undefined}
      />
      <AuthInput
        T={T}
        icon="lock"
        placeholder="Confirm Password"
        value={form.confirmPassword}
        onChangeText={(t) => update('confirmPassword', t)}
        secure={!showConfirm}
        showToggle
        onToggleSecure={() => setShowConfirm(!showConfirm)}
        onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
        valid={touched.confirmPassword ? confirmOk : null}
        error={touched.confirmPassword && !confirmOk ? 'Passwords must match' : undefined}
      />
      <PrimaryButton label="Continue →" onPress={onNext} disabled={!valid} style={{ marginTop: 8 }} />
    </View>
  );
}

export function Step2Brand({
  form,
  update,
  onNext,
  onBack,
}: {
  form: SignupFormData;
  update: (k: keyof SignupFormData, v: SignupFormData[keyof SignupFormData]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const T = useTheme();
  const [industryOpen, setIndustryOpen] = useState(false);

  const pickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      update('logoUri', res.assets[0].uri);
    }
  };

  const canContinue = form.brandName.trim().length >= 2 && form.industry.length > 0;

  return (
    <View>
      <Text style={[styles.stepTitle, { color: T.text }]}>Your Brand</Text>
      <Text style={[styles.stepSub, { color: T.textSecondary }]}>
        Upload your logo — we use it for your brand colors on the dashboard
      </Text>
      <AuthInput
        T={T}
        icon="briefcase"
        placeholder="e.g. Outfitters, Khaadi, Broadway Pizza"
        value={form.brandName}
        onChangeText={(t) => update('brandName', t)}
      />
      <AuthInput
        T={T}
        icon="globe"
        placeholder="https://yourwebsite.com (optional)"
        value={form.websiteUrl}
        onChangeText={(t) => update('websiteUrl', t)}
        keyboardType="url"
      />
      <View style={styles.helperRow}>
        <Feather name="zap" size={10} color={T.accent} />
        <Text style={[styles.helperText, { color: T.accent }]}>
          Optional: website helps us detect slogan & keywords only
        </Text>
      </View>
      <View style={[styles.scrapeNote, { borderLeftColor: T.accent, backgroundColor: T.withAlpha(T.accent, 0.08) }]}>
        <Text style={[styles.scrapeNoteText, { color: T.textSecondary }]}>
          Your uploaded logo sets theme colors. Website URL is optional and only used for slogan/keywords — not to replace your logo.
        </Text>
      </View>
      <TouchableOpacity
        onPress={pickLogo}
        style={[
          styles.uploadBox,
          { borderColor: T.border },
          form.logoUri ? styles.uploadBoxFilled : null,
        ]}
      >
        {form.logoUri ? (
          <View style={styles.uploadRow}>
            <Image source={{ uri: form.logoUri }} style={styles.thumb} />
            <Text style={[styles.changeText, { color: T.accent }]}>Change</Text>
          </View>
        ) : (
          <>
            <Feather name="upload-cloud" size={28} color={T.textMuted} />
            <Text style={[styles.uploadLabel, { color: T.textSecondary }]}>Upload Logo</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIndustryOpen(true)}
        style={[styles.inputWrap, T.glassInput, { borderColor: T.glassInput.borderColor }]}
      >
        <Feather name="tag" size={18} color={T.textMuted} />
        <Text style={{ flex: 1, color: form.industry ? T.text : T.textMuted, marginLeft: 10 }}>
          {form.industry || 'Select Industry'}
        </Text>
        <Feather name="chevron-down" size={16} color={T.textSecondary} />
      </TouchableOpacity>
      <View style={styles.btnRow}>
        <SecondaryButton label="← Back" onPress={onBack} style={{ width: 100 }} />
        <PrimaryButton label="Continue →" onPress={onNext} disabled={!canContinue} style={{ flex: 1, marginLeft: 12 }} />
      </View>
      <SpotlightModal visible={industryOpen} onClose={() => setIndustryOpen(false)} scroll={true}>
        <Text style={[styles.modalTitle, { color: T.text }]}>Industry</Text>
        {INDUSTRIES.map((ind) => (
          <TouchableOpacity
            key={ind}
            style={[styles.industryItem, { borderBottomColor: T.divider }]}
            onPress={() => {
              update('industry', ind);
              setIndustryOpen(false);
            }}
          >
            <Text style={{ color: T.text }}>{ind}</Text>
          </TouchableOpacity>
        ))}
      </SpotlightModal>
    </View>
  );
}

export function Step3Social({
  form,
  updateSocial,
  onNext,
  onBack,
}: {
  form: SignupFormData;
  updateSocial: (p: keyof SignupFormData['socialHandles'], h: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const T = useTheme();
  const [connectPlatform, setConnectPlatform] = useState<keyof SignupFormData['socialHandles'] | null>(null);
  const [handleDraft, setHandleDraft] = useState('');

  return (
    <View>
      <Text style={[styles.stepTitle, { color: T.text }]}>Connect Platforms</Text>
      <Text style={[styles.stepSub, { color: T.textSecondary }]}>
        Connect to publish campaigns directly
      </Text>
      {PLATFORMS.map((p, i) => {
        const handle = form.socialHandles[p.id];
        const connected = !!handle;
        return (
          <Card key={p.id} animated delay={i * 80} style={styles.platformCard}>
            <View style={[styles.platformIcon, { backgroundColor: p.color }]}>
              <Ionicons name={p.icon as keyof typeof Ionicons.glyphMap} size={22} color="#FFFFFF" />
            </View>
            <View style={styles.platformInfo}>
              <Text style={[styles.platformName, { color: T.text }]}>{p.name}</Text>
              <Text style={{ color: connected ? SEM.success : T.textMuted, fontSize: 12 }}>
                {connected ? `Connected ✓ @${handle?.replace('@', '')}` : 'Not connected'}
              </Text>
            </View>
            {connected ? (
              <Feather name="check-circle" size={24} color={SEM.success} />
            ) : (
              <SecondaryButton
                label="Connect"
                onPress={() => {
                  setConnectPlatform(p.id);
                  setHandleDraft('');
                }}
                style={styles.connectBtn}
              />
            )}
          </Card>
        );
      })}
      <Text style={[styles.skipNote, { color: T.textMuted }]}>
        You can connect platforms later from Settings
      </Text>
      <View style={styles.btnRow}>
        <SecondaryButton label="← Back" onPress={onBack} style={{ width: 100 }} />
        <PrimaryButton label="Continue →" onPress={onNext} style={{ flex: 1, marginLeft: 12 }} />
      </View>
      <SpotlightModal
        visible={!!connectPlatform}
        onClose={() => setConnectPlatform(null)}
        scroll={false}
      >
        <Text style={[styles.modalTitle, { color: T.text }]}>Enter your @handle</Text>
        <AuthInput
          T={T}
          icon="at-sign"
          placeholder="@yourbrand"
          value={handleDraft}
          onChangeText={setHandleDraft}
        />
        <PrimaryButton
          label="Connect"
          onPress={() => {
            if (connectPlatform && handleDraft.trim()) {
              updateSocial(connectPlatform, handleDraft.startsWith('@') ? handleDraft : `@${handleDraft}`);
            }
            setConnectPlatform(null);
          }}
        />
      </SpotlightModal>
    </View>
  );
}

function maskEmail(email: string) {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  return `${user.slice(0, 2)}***@${domain}`;
}

export function Step4Review({
  form,
  update,
  onBack,
  onSubmit,
  loading,
  goStep,
  onOpenTerms,
}: {
  form: SignupFormData;
  update: (k: keyof SignupFormData, v: SignupFormData[keyof SignupFormData]) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  goStep: (n: number) => void;
  onOpenTerms: () => void;
}) {
  const T = useTheme();
  const connected = PLATFORMS.filter((p) => form.socialHandles[p.id]);

  return (
    <View>
      <Text style={[styles.stepTitle, { color: T.text }]}>Review & Confirm</Text>
      <Text style={[styles.stepSub, { color: T.textSecondary }]}>Everything look good?</Text>
      <Card style={styles.reviewCard}>
        <View style={styles.reviewHead}>
          <Feather name="user" size={16} color={T.accent} />
          <Text style={[styles.reviewLabel, { color: T.text }]}>Account Details</Text>
          <TouchableOpacity onPress={() => goStep(1)}>
            <Feather name="edit-2" size={16} color={T.accent} />
          </TouchableOpacity>
        </View>
        <Text style={{ color: T.textSecondary }}>{form.fullName}</Text>
        <Text style={{ color: T.textSecondary }}>{maskEmail(form.email)}</Text>
      </Card>
      <Card style={styles.reviewCard}>
        <View style={styles.reviewHead}>
          <Feather name="briefcase" size={16} color={T.accent} />
          <Text style={[styles.reviewLabel, { color: T.text }]}>Brand Info</Text>
          <TouchableOpacity onPress={() => goStep(2)}>
            <Feather name="edit-2" size={16} color={T.accent} />
          </TouchableOpacity>
        </View>
        <Text style={{ color: T.text }}>{form.brandName}</Text>
        <Text style={{ color: T.textSecondary }}>{form.industry}</Text>
        {form.websiteUrl ? <Text style={{ color: T.textSecondary }}>{form.websiteUrl}</Text> : null}
        {form.logoUri ? <Image source={{ uri: form.logoUri }} style={styles.reviewLogo} /> : null}
      </Card>
      <Card style={styles.reviewCard}>
        <View style={styles.reviewHead}>
          <Feather name="share-2" size={16} color={T.accent} />
          <Text style={[styles.reviewLabel, { color: T.text }]}>Connected Platforms</Text>
          <TouchableOpacity onPress={() => goStep(3)}>
            <Feather name="edit-2" size={16} color={T.accent} />
          </TouchableOpacity>
        </View>
        {connected.length ? (
          <View style={styles.badgeRow}>
            {connected.map((p) => (
              <View key={p.id} style={[styles.socialBadge, { backgroundColor: p.color }]}>
                <Text style={styles.socialBadgeText}>{p.name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: T.textMuted }}>None connected</Text>
        )}
      </Card>
      <View style={styles.termsRow}>
        <TouchableOpacity
          onPress={() => update('termsAccepted', !form.termsAccepted)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: form.termsAccepted ? T.btnPrimary : T.btnSecondary,
                borderColor: T.border,
              },
            ]}
          >
            {form.termsAccepted ? <Feather name="check" size={14} color={T.btnPrimaryText} /> : null}
          </View>
        </TouchableOpacity>
        <Text style={[styles.termsText, { color: T.textSecondary }]}>
          I agree to{' '}
          <Text
            onPress={onOpenTerms}
            style={{ color: T.accent, textDecorationLine: 'underline', fontWeight: '600' }}
          >
            Terms of Service
          </Text>{' '}
          and Privacy Policy
        </Text>
      </View>
      <View style={styles.btnRow}>
        <SecondaryButton label="← Back" onPress={onBack} style={{ width: 100 }} />
        <PrimaryButton
          label={loading ? 'Setting up your workspace...' : 'Create Account'}
          onPress={onSubmit}
          loading={loading}
          disabled={!form.termsAccepted}
          style={{ flex: 1, marginLeft: 12 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  stepSub: { fontSize: 13, marginBottom: 16 },
  inputBlock: { marginBottom: 12 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    minHeight: 50,
    borderWidth: 1,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  errText: { fontSize: 11, marginTop: 4, marginLeft: 4 },
  helperRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -4, marginBottom: 8 },
  helperText: { fontSize: 11 },
  scrapeNote: { borderLeftWidth: 3, padding: 10, marginBottom: 12, borderRadius: 8 },
  scrapeNoteText: { fontSize: 11, lineHeight: 16 },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadBoxFilled: { height: 'auto', padding: 12 },
  uploadRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 80, height: 80, borderRadius: 12 },
  changeText: { fontSize: 14, fontWeight: '600' },
  uploadLabel: { fontSize: 14, marginTop: 6 },
  btnRow: { flexDirection: 'row', marginTop: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  industryItem: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  platformCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  platformIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  platformInfo: { flex: 1 },
  platformName: { fontSize: 15, fontWeight: '700' },
  connectBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  skipNote: { fontSize: 12, textAlign: 'center', marginVertical: 12 },
  reviewCard: { marginBottom: 10 },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  reviewLabel: { flex: 1, fontWeight: '600' },
  reviewLogo: { width: 40, height: 40, borderRadius: 8, marginTop: 8 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  socialBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  socialBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginVertical: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
