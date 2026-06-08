import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Image, ActivityIndicator, Alert, Modal, Dimensions, Animated, StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../theme/useTheme';
import { useUserStore } from '../store/userStore';
import { sendEmailCampaignApi, BASE_URL } from '../api/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { scaleIn } from '../utils/animations';
import { resolveMediaUrl } from '../utils/mediaUrl';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EmailOutreachScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const T = useTheme();
  const token = useUserStore(state => state.token);
  const userProfile = useUserStore(state => state.userProfile);

  const { campaign_id, campaign_name, ad_copy, image_url, video_url } = route.params || {};

  // Resolve default subject and ad body text from generated copy
  const defaultAdText = ad_copy?.copies?.instagram?.english?.body || ad_copy?.copies?.facebook?.english?.body || 'Check out our latest premium strategy! Elevating designs and retail experiences across Pakistan.';
  const defaultSubject = ad_copy?.copies?.instagram?.english?.headline || ad_copy?.copies?.facebook?.english?.headline || `Exclusive Premium Offer from ${userProfile?.business_name || 'Brand'}`;

  // Form states
  const [subject, setSubject] = useState(defaultSubject);
  const [adText, setAdText] = useState(defaultAdText);
  const [leadsFile, setLeadsFile] = useState<any>(null);
  const [detectedEmails, setDetectedEmails] = useState<string[]>([]);
  const [rawEmailsText, setRawEmailsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState('');
  
  // Celebration States
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationDetails, setCelebrationDetails] = useState<any>(null);
  const checkScale = useRef(new Animated.Value(0)).current;

  // Animation values for confetti
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      y: new Animated.Value(-20),
      x: new Animated.Value(Math.random() * SCREEN_WIDTH),
      opacity: new Animated.Value(1),
    }))
  ).current;

  const brandColor = userProfile?.brand_color || '#6C63FF';
  const logoUrl = resolveMediaUrl(userProfile?.logo_url) || '';
  const initial = userProfile?.business_name?.[0]?.toUpperCase() || 'B';

  const pickLeadsCsv = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        setLeadsFile(file);

        // Pre-parse emails on the frontend for visual feedback/validation
        setProgressText('Reading leads CSV...');
        try {
          const response = await fetch(file.uri);
          const text = await response.text();
          // Regex search for all valid emails
          const emailsFound = text.match(/[a-zA-Z0-9\.\-+_]+@[a-zA-Z0-9\.\-+_]+\.[a-zA-Z]+/g) || [];
          const deduped = Array.from(new Set(emailsFound.map(e => e.trim().toLowerCase())));
          setDetectedEmails(deduped);
        } catch (readErr) {
          console.warn('[CSV Parse Warn] Failed to pre-parse file locally:', readErr);
        }
      }
    } catch (e: any) {
      Alert.alert('File Picker Error', e.message);
    }
  };

  const handleLaunchCampaign = async () => {
    if (!leadsFile && detectedEmails.length === 0) {
      Alert.alert('Leads list required', 'Please upload a CSV file containing your customer lead emails.');
      return;
    }

    setLoading(true);
    setProgressText('Launching dynamic email outreach...');

    try {
      const result = await sendEmailCampaignApi(token!, {
        campaign_id: campaign_id || 'demo-campaign-id',
        subject: subject,
        ad_text: adText,
        image_url: image_url || 'https://image.pollinations.ai/prompt/premium_aesthetic_fashion_brand_ad',
        video_url: video_url || '',
        leads_csv_file: leadsFile,
        emails: detectedEmails
      });

      if (result.status === 'success' || result.success_count > 0) {
        setCelebrationDetails(result);
        setShowCelebration(true);
        scaleIn(checkScale, 0).start();

        // Confetti drop
        confettiAnims.forEach((c, i) => {
          c.y.setValue(-20);
          c.opacity.setValue(1);
          Animated.parallel([
            Animated.timing(c.y, {
              toValue: SCREEN_HEIGHT + 40,
              duration: 2000 + i * 85,
              useNativeDriver: true,
            }),
            Animated.timing(c.opacity, {
              toValue: 0,
              duration: 2200,
              useNativeDriver: true,
            })
          ]).start();
        });
      } else {
        Alert.alert('Campaign failed', 'Your email outreach campaign failed. Please check your Resend key in the backend environment.');
      }
    } catch (e: any) {
      Alert.alert('Outreach Error', e.message || 'Failed to dispatch email campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />

      {/* ── HEADER ── */}
      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={T.accent} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: T.text }]}>Email Campaign Outreach</Text>
          <Text style={[styles.headerSub, { color: T.textSecondary }]}>Send premium customized creatives directly to inbox</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* Campaign Identification */}
        <View style={[styles.infoBanner, { backgroundColor: T.card }]}>
          <Feather name="mail" size={20} color={T.accent} />
          <View style={styles.infoBannerText}>
            <Text style={[styles.infoLabel, { color: T.text }]}>Active Campaign</Text>
            <Text style={[styles.infoValue, { color: T.textSecondary }]}>{campaign_name || 'My Season Campaign'}</Text>
          </View>
        </View>

        {/* ── INPUTS & CUSTOMIZATION ── */}
        <Text style={[styles.sectionTitle, { color: T.text }]}>Customize Email Message</Text>
        <Card style={styles.formCard}>
          <Text style={[styles.formLabel, { color: T.text }]}>Email Subject Line</Text>
          <TextInput
            style={[styles.input, { borderColor: T.border, color: T.text, backgroundColor: T.btnSecondary }]}
            placeholder="e.g. Elegant Outfitters Summer launch!"
            placeholderTextColor={T.textMuted}
            value={subject}
            onChangeText={setSubject}
            autoCorrect={false}
          />

          <Text style={[styles.formLabel, { color: T.text }]}>Email Message Body</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { borderColor: T.border, color: T.text, backgroundColor: T.btnSecondary }]}
            placeholder="Type your email campaign copy here..."
            placeholderTextColor={T.textMuted}
            value={adText}
            onChangeText={setAdText}
            multiline
            numberOfLines={5}
            autoCorrect={false}
          />
        </Card>

        {/* ── CUSTOMER LEADS CSV FILE ── */}
        <Text style={[styles.sectionTitle, { color: T.text }]}>Recipient Customer Leads</Text>
        <Card style={styles.leadsCard}>
          <Text style={[styles.leadsDesc, { color: T.textSecondary }]}>
            Enter recipient emails manually (separated by commas or spaces) OR upload a `.csv` lead list.
          </Text>

          <Text style={[styles.formLabel, { color: T.text, marginTop: 4, marginBottom: 8 }]}>Manual Recipient List</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { borderColor: T.border, color: T.text, backgroundColor: T.btnSecondary, height: 68, fontSize: 13, marginBottom: 16 }]}
            placeholder="e.g. hello@brand.com, manager@shell.com"
            placeholderTextColor={T.textMuted}
            value={rawEmailsText}
            onChangeText={(text) => {
              setRawEmailsText(text);
              const found = text.match(/[a-zA-Z0-9\.\-+_]+@[a-zA-Z0-9\.\-+_]+\.[a-zA-Z]+/g) || [];
              const deduped = Array.from(new Set(found.map(e => e.trim().toLowerCase())));
              setDetectedEmails(deduped);
            }}
            multiline
            autoCorrect={false}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: T.divider }} />
            <Text style={{ fontSize: 11, color: T.textMuted, fontWeight: '700' }}>OR UPLOAD CSV</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: T.divider }} />
          </View>

          <TouchableOpacity
            style={[styles.uploadBtn, { borderColor: T.accent, backgroundColor: T.accent + '15' }]}
            onPress={pickLeadsCsv}
          >
            <Feather name="upload-cloud" size={24} color={T.accent} />
            <Text style={[styles.uploadBtnText, { color: T.accent }]}>
              {leadsFile ? 'Change Lead CSV File' : 'Upload Customer Lead CSV'}
            </Text>
          </TouchableOpacity>

          {leadsFile && (
            <View style={styles.fileDetailRow}>
              <Ionicons name="document-text" size={20} color="#22C55E" />
              <Text style={[styles.fileName, { color: T.text }]} numberOfLines={1}>
                {leadsFile.name}
              </Text>
              <Badge label={`${detectedEmails.length} Emails`} />
            </View>
          )}

          {detectedEmails.length > 0 && (
            <View style={styles.emailsPreview}>
              <Text style={[styles.emailsPreviewTitle, { color: T.text }]}>Detected Recipients Preview:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emailsScroll}>
                {detectedEmails.slice(0, 8).map((email, i) => (
                  <View key={i} style={[styles.emailChip, { backgroundColor: T.btnSecondary }]}>
                    <Text style={[styles.emailChipText, { color: T.textSecondary }]}>{email}</Text>
                  </View>
                ))}
                {detectedEmails.length > 8 && (
                  <Text style={[styles.moreEmailsText, { color: T.textSecondary }]}>+{detectedEmails.length - 8} more</Text>
                )}
              </ScrollView>
            </View>
          )}
        </Card>

        {/* ── LIVE PREVIEW INBOX MOCKUP ── */}
        <Text style={[styles.sectionTitle, { color: T.text }]}>Live Email Inbox Preview</Text>
        <Text style={[styles.sectionSubtitle, { color: T.textSecondary }]}>This is exactly how your email campaign will show in the customer inbox.</Text>
        
        <View style={styles.inboxWrapper}>
          {/* Inbox Header Simulation */}
          <View style={[styles.inboxHeader, { backgroundColor: T.isDarkMode ? '#222630' : '#E8EEF5' }]}>
            <View style={styles.inboxDotRow}>
              <View style={[styles.inboxDot, { backgroundColor: '#FF5F56' }]} />
              <View style={[styles.inboxDot, { backgroundColor: '#FFBD2E' }]} />
              <View style={[styles.inboxDot, { backgroundColor: '#27C93F' }]} />
            </View>
            <Text style={[styles.inboxSubjectPreview, { color: T.textSecondary }]} numberOfLines={1}>
              Subject: {subject}
            </Text>
          </View>

          {/* Email HTML Container */}
          <View style={styles.emailContainer}>
            {/* Dynamic Brand Color Header Band */}
            <View style={[styles.emailHeaderBand, { backgroundColor: brandColor }]}>
              <View style={styles.emailLogoBox}>
                {logoUrl ? (
                  <Image source={{ uri: logoUrl }} style={styles.emailLogoImg} resizeMode="contain" />
                ) : (
                  <Text style={[styles.emailLogoInitial, { color: brandColor }]}>{initial}</Text>
                )}
              </View>
              <Text style={styles.emailBusinessName}>{userProfile?.business_name || 'My Brand'}</Text>
              <Text style={styles.emailCollectionTag}>EXCLUSIVE COLLECTION</Text>
            </View>

            {/* Email Body Card */}
            <View style={styles.emailMainCard}>
              <View style={styles.emailMessageCard}>
                <Text style={styles.emailMessageTitle}>Introducing Our Latest Strategy</Text>
                <Text style={styles.emailMessageBody}>{adText}</Text>
              </View>

              {/* Generated Hero Ad Image */}
              {image_url ? (
                <View style={styles.emailAdImageWrapper}>
                  <Image source={{ uri: resolveMediaUrl(image_url) }} style={styles.emailAdImage} resizeMode="cover" />
                </View>
              ) : (
                <View style={styles.emailAdImagePlaceholder}>
                  <Feather name="image" size={32} color="#4b5563" />
                  <Text style={styles.emailPlaceholderText}>Ad Creative Banner Renders Here</Text>
                </View>
              )}

              {/* Dynamic CTA Button */}
              <View style={styles.emailCtaWrapper}>
                <View style={[styles.emailCtaBtn, { backgroundColor: brandColor }]}>
                  <Text style={styles.emailCtaBtnText}>SHOP NOW — EXCLUSIVE OFFER</Text>
                </View>
              </View>

              {video_url && (
                <Text style={[styles.emailVideoLink, { color: brandColor }]}>
                  Or Watch Our AI Promo Video Here &gt;
                </Text>
              )}
            </View>

            {/* Email Footer */}
            <View style={styles.emailFooterBand}>
              <Text style={styles.emailFooterSent}>Sent via InsightFlow AI</Text>
              <Text style={styles.emailFooterLegal}>
                You are receiving this promotional email because you are a valued customer of {userProfile?.business_name || 'Brand'}.
              </Text>
            </View>
          </View>
        </View>

        {/* ── LAUNCH BUTTON ── */}
        {loading ? (
          <View style={styles.launchingBox}>
            <ActivityIndicator size="large" color={T.accent} />
            <Text style={[styles.launchingText, { color: T.textSecondary }]}>{progressText}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.launchBtn, { backgroundColor: '#22C55E' }]}
            onPress={handleLaunchCampaign}
          >
            <Text style={styles.launchBtnText}>Launch Email Campaign Outreach</Text>
          </TouchableOpacity>
        )}
        
      </ScrollView>

      {/* ── CELEBRATION MODAL ── */}
      <Modal visible={showCelebration} animationType="fade" transparent={false}>
        <View style={[styles.celebrate, { backgroundColor: T.bg }]}>
          {confettiAnims.map((c, i) => (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i % 2 === 0 ? brandColor : T.accent,
                opacity: c.opacity,
                transform: [{ translateX: c.x }, { translateY: c.y }],
              }}
            />
          ))}

          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <Ionicons name="checkmark-circle" size={90} color="#22C55E" />
          </Animated.View>

          <Text style={[styles.celebrateTitle, { color: T.text }]}>Campaign Dispatched!</Text>
          
          <Card style={styles.celebrateStatsCard}>
            <View style={styles.celebrateStatRow}>
              <Text style={[styles.statLabel, { color: T.textSecondary }]}>Total Attempted</Text>
              <Text style={[styles.statVal, { color: T.text }]}>{celebrationDetails?.total_attempted || 0} Leads</Text>
            </View>
            <View style={styles.celebrateStatRow}>
              <Text style={[styles.statLabel, { color: T.textSecondary }]}>Successfully Sent</Text>
              <Text style={[styles.statVal, { color: '#22C55E' }]}>{celebrationDetails?.success_count || 0} Emails</Text>
            </View>
            {celebrationDetails?.failed_count > 0 && (
              <View style={styles.celebrateStatRow}>
                <Text style={[styles.statLabel, { color: T.textSecondary }]}>Failed / Sandbox Filtered</Text>
                <Text style={[styles.statVal, { color: '#EF4444' }]}>{celebrationDetails?.failed_count} Emails</Text>
              </View>
            )}
          </Card>

          <Text style={[styles.celebrateSub, { color: T.textSecondary }]}>
            Your premium dynamic HTML emails have been successfully compiled and sent out via the Resend API!
          </Text>

          <TouchableOpacity
            style={[styles.celebrateCloseBtn, { backgroundColor: T.accent }]}
            onPress={() => {
              setShowCelebration(false);
              navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
            }}
          >
            <Text style={styles.celebrateCloseText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { paddingRight: 12 },
  headerTitles: { flex: 1 },
  headerTitle: { fontSize: 19, fontWeight: '800' },
  headerSub: { fontSize: 11, marginTop: 2 },
  scroll: { padding: 18, paddingBottom: 60 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoBannerText: { flex: 1 },
  infoLabel: { fontSize: 12, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginTop: 16, marginBottom: 10 },
  sectionSubtitle: { fontSize: 12, marginBottom: 12, lineHeight: 16 },
  formCard: { padding: 16, marginBottom: 20 },
  formLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  multilineInput: {
    height: 110,
    textAlignVertical: 'top',
  },
  leadsCard: { padding: 16, marginBottom: 20 },
  leadsDesc: { fontSize: 12, lineHeight: 18, marginBottom: 16 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  uploadBtnText: { fontSize: 14, fontWeight: '700' },
  fileDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#00000010',
    marginTop: 4,
  },
  fileName: { flex: 1, fontSize: 13, fontWeight: '600' },
  emailsPreview: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#00000015' },
  emailsPreviewTitle: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  emailsScroll: { flexDirection: 'row' },
  emailChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
  emailChipText: { fontSize: 11, fontWeight: '600' },
  moreEmailsText: { fontSize: 11, fontWeight: '600', alignSelf: 'center', paddingLeft: 4 },
  inboxWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  inboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  inboxDotRow: { flexDirection: 'row', gap: 6 },
  inboxDot: { width: 8, height: 8, borderRadius: 4 },
  inboxSubjectPreview: { fontSize: 12, fontWeight: '700', flex: 1 },
  emailContainer: { backgroundColor: '#1a1d24', width: '100%' },
  emailHeaderBand: { paddingVertical: 32, paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  emailLogoBox: { width: 56, height: 56, backgroundColor: '#ffffff', borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emailLogoImg: { width: '100%', height: '100%' },
  emailLogoInitial: { fontSize: 24, fontWeight: '800' },
  emailBusinessName: { color: '#ffffff', fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  emailCollectionTag: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginTop: 4 },
  emailMainCard: { padding: 24 },
  emailMessageCard: { backgroundColor: '#232730', borderRadius: 14, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  emailMessageTitle: { color: '#ffffff', fontSize: 15, fontWeight: '800', marginBottom: 8, fontFamily: 'Georgia' },
  emailMessageBody: { color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 18 },
  emailAdImageWrapper: { borderRadius: 12, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  emailAdImage: { width: '100%', height: 220 },
  emailAdImagePlaceholder: { height: 180, backgroundColor: '#121419', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 },
  emailPlaceholderText: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
  emailCtaWrapper: { alignItems: 'center', marginVertical: 8 },
  emailCtaBtn: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 25 },
  emailCtaBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  emailVideoLink: { fontSize: 11, textAlign: 'center', textDecorationLine: 'underline', fontWeight: '700', marginTop: 14 },
  emailFooterBand: { backgroundColor: '#121419', padding: 24, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  emailFooterSent: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  emailFooterLegal: { color: 'rgba(255,255,255,0.2)', fontSize: 9, textAlign: 'center', marginTop: 8, lineHeight: 13 },
  launchBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  launchBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  launchingBox: { alignItems: 'center', paddingVertical: 20, marginBottom: 40, gap: 10 },
  launchingText: { fontSize: 13, fontWeight: '600' },
  celebrate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  celebrateTitle: { fontSize: 26, fontWeight: '800', marginTop: 20, marginBottom: 12 },
  celebrateSub: { fontSize: 14, textAlign: 'center', marginTop: 12, paddingHorizontal: 16, lineHeight: 20 },
  celebrateStatsCard: { width: '100%', padding: 18, marginVertical: 16, gap: 12 },
  celebrateStatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: 13, fontWeight: '500' },
  statVal: { fontSize: 14, fontWeight: '700' },
  celebrateCloseBtn: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, marginTop: 24 },
  celebrateCloseText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
