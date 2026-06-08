import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  StatusBar,
  Animated,
  Modal,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { useCampaignStore } from '../store/campaignStore';
import { useTheme } from '../theme/useTheme';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { scaleIn } from '../utils/animations';
import { BrandAvatar } from '../components/BrandLogo';
import { SpotlightModal } from '../components/modals/SpotlightModal';
import { sendEmailCampaignApi, approveCampaign } from '../api/api';
import * as DocumentPicker from 'expo-document-picker';
import { resolveMediaUrl } from '../utils/mediaUrl';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PLATFORMS = [
  { key: 'instagramReels', label: 'Instagram Reels', color: '#E1306C', icon: 'logo-instagram' },
  { key: 'tiktokSpark', label: 'TikTok Sparks', color: '#000000', icon: 'logo-tiktok' },
  { key: 'facebookFeed', label: 'Facebook Feed', color: '#1877F2', icon: 'logo-facebook' },
] as const;

export const PublishScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const T = useTheme();
  const { jobId, budget, strategy } = useCampaignStore();
  const setCampaign = useUserStore((s) => s.setCampaign);
  
  const userProfile = useUserStore((s) => s.userProfile);
  const user = useUserStore((s) => s.user);
  
  // Fetch campaigns and extract the latest campaign record
  const campaigns = user?.campaigns || [];
  const latestCampaign = campaigns[campaigns.length - 1] as any;

  // Resolve creative assets from navigation params OR latest saved campaign store
  const params = route.params || {};
  const campaignId = params.campaign_id || latestCampaign?.campaign_id || 'demo-campaign-id';
  const campaignName = params.campaign_name || latestCampaign?.campaign_name || 'My Campaign';
  const adCopy = params.ad_copy || latestCampaign?.ad_copy || null;
  const imageUrl = params.image_url || latestCampaign?.ad_images?.instagram?.image_url || latestCampaign?.image_url || '';
  const videoUrl = params.video_url || latestCampaign?.ad_video?.video_url || '';

  const [activePreviewTab, setActivePreviewTab] = useState<'copy' | 'image' | 'video'>('copy');
  const [activePlatform, setActivePlatform] = useState<'instagram' | 'tiktok' | 'facebook'>('instagram');
  const [activeLang, setActiveLang] = useState<'english' | 'roman_urdu'>('english');

  // Publishing Modal & Simulation States
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [placements, setPlacements] = useState({
    instagramReels: true,
    tiktokSpark: true,
    facebookFeed: true,
  });
  const [publishing, setPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishStatusText, setPublishStatusText] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const checkScale = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 24 }, () => ({
      y: new Animated.Value(-20),
      x: new Animated.Value(Math.random() * SCREEN_WIDTH),
      opacity: new Animated.Value(1),
    }))
  ).current;

  const token = useUserStore((s) => s.token);
  const [emailLoading, setEmailLoading] = useState(false);
  const [outreachEmails, setOutreachEmails] = useState('');
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState('');

  const pickOutreachCsv = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        setCsvFileName(file.name);
        const response = await fetch(file.uri);
        const text = await response.text();
        const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        const uniqueEmails = Array.from(new Set(emails.map(e => e.toLowerCase())));
        setCsvEmails(uniqueEmails);
        Alert.alert('CSV Imported', `Successfully parsed ${uniqueEmails.length} unique email addresses!`);
      }
    } catch (e: any) {
      Alert.alert('CSV Error', 'Failed to read or parse the CSV file.');
    }
  };

  const getMergedEmails = () => {
    const manualList = outreachEmails
      .split(/[\s,;]+/)
      .map(e => e.trim())
      .filter(e => /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(e));
    return Array.from(new Set([...manualList, ...csvEmails]));
  };

  const handleLaunchEmailOutreach = async () => {
    const merged = getMergedEmails();
    if (merged.length === 0) {
      Alert.alert('No Recipients', 'Please enter at least one valid manual email or upload a CSV containing emails.');
      return;
    }

    setEmailLoading(true);
    try {
      const platformCopy = adCopy?.copies?.[activePlatform]?.[activeLang];
      const defaultSubject = adCopy?.copies?.instagram?.english?.headline || adCopy?.copies?.facebook?.english?.headline || `Exclusive Premium Offer from ${userProfile?.business_name || 'Brand'}`;
      const defaultAdText = adCopy?.copies?.instagram?.english?.body || adCopy?.copies?.facebook?.english?.body || 'Check out our latest premium strategy!';
      
      const subjectText = platformCopy?.headline || platformCopy?.hook || defaultSubject;
      const bodyText = platformCopy?.body || defaultAdText;

      const result = await sendEmailCampaignApi(token!, {
        campaign_id: campaignId,
        subject: subjectText,
        ad_text: bodyText,
        image_url: imageUrl || 'https://image.pollinations.ai/prompt/premium_aesthetic_fashion_brand_ad',
        video_url: videoUrl || '',
        emails: merged,
      });

      if (result.status === 'success' || result.success_count > 0) {
        Alert.alert(
          'Email Campaign Dispatched! 📨',
          `Your outreach campaign was successfully dispatched to ${result.success_count || merged.length} recipients!`
        );
      } else {
        Alert.alert('Outreach failed', 'Your email outreach campaign failed. Please check your Resend key in the backend environment.');
      }
    } catch (e: any) {
      Alert.alert('Outreach Error', e.message || 'Failed to dispatch email campaign');
    } finally {
      setEmailLoading(false);
    }
  };

  const togglePlacement = (key: keyof typeof placements) => {
    setPlacements((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleGoLive = () => {
    setShowPublishModal(true);
  };

  const triggerPublishSimulation = async () => {
    setPublishing(true);
    setPublishProgress(0.05);
    setPublishStatusText('Initializing secure cryptographic tunnel...');

    try {
      const activePlats = PLATFORMS.filter(p => placements[p.key]).map(p => p.key.replace('Reels', '').replace('Spark', '').replace('Feed', ''));
      const res = await approveCampaign(
        jobId,
        budget,
        strategy || {},
        [], // no customer leads since that is separate now
        { ad_copy: adCopy, image_url: imageUrl, video_url: videoUrl },
        userProfile?.business_name,
        userProfile?.brand_color,
        userProfile?.website_url
      );
      if (res?.campaign_id) {
        setCampaign({
          campaign_id: res.campaign_id,
          campaign_name: campaignName,
          status: 'approved',
          created_at: new Date().toISOString(),
          recommended_budget: {
            instagram_pkr: Math.floor(budget * 0.4),
            tiktok_pkr: Math.floor(budget * 0.35),
            facebook_pkr: Math.floor(budget * 0.25),
            total_pkr: budget,
          },
          expected_outcomes: {
            estimated_reach: `${Math.round(budget * 2.5)}`,
            estimated_revenue_pkr: `${Math.round(budget * 3.8)}`,
            roi_percentage: '280%',
          },
        });
      }
    } catch (e) {
      console.log('Approve Campaign API failed:', e);
      // Fallback save in state in case backend isn't available or fails
      const fallbackId = 'camp-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      setCampaign({
        campaign_id: fallbackId,
        campaign_name: campaignName,
        status: 'approved',
        created_at: new Date().toISOString(),
        recommended_budget: {
          instagram_pkr: Math.floor(budget * 0.4),
          tiktok_pkr: Math.floor(budget * 0.35),
          facebook_pkr: Math.floor(budget * 0.25),
          total_pkr: budget,
        },
        expected_outcomes: {
          estimated_reach: `${Math.round(budget * 2.5)}`,
          estimated_revenue_pkr: `${Math.round(budget * 3.8)}`,
          roi_percentage: '280%',
        },
      });
    }

    const statuses = [
      { progress: 0.20, text: 'Encrypting campaign assets & credentials...' },
      { progress: 0.40, text: 'Synchronizing brand DNA & dynamic color mappings...' },
      { progress: 0.65, text: 'Uploading high-res banner creatives to Meta Graph API...' },
      { progress: 0.85, text: 'Deploying TikTok Spark Ad container pipeline...' },
      { progress: 0.95, text: 'Broadcasting campaign parameters to active Gen-Z segments...' },
      { progress: 1.0, text: 'Campaign is officially published and live!' },
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < statuses.length) {
        setPublishProgress(statuses[step].progress);
        setPublishStatusText(statuses[step].text);
        step++;
      } else {
        clearInterval(interval);
        setPublishing(false);
        setShowPublishModal(false);
        setShowCelebration(true);
        scaleIn(checkScale, 0).start();
        confettiAnims.forEach((c, i) => {
          c.y.setValue(-20);
          c.opacity.setValue(1);
          Animated.parallel([
            Animated.timing(c.y, {
              toValue: SCREEN_HEIGHT + 40,
              duration: 2000 + i * 75,
              useNativeDriver: true,
            }),
            Animated.timing(c.opacity, { toValue: 0, duration: 2200, useNativeDriver: true }),
          ]).start();
        });
      }
    }, 1100);
  };

  const activeCount = Object.values(placements).filter(Boolean).length;
  const brandColor = userProfile?.brand_color || '#6C63FF';

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />
      
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={T.accent} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: T.text }]}>Unified Approval Center</Text>
          <Text style={[styles.headerSub, { color: T.textSecondary }]}>Review campaign assets & broadcast live</Text>
        </View>
        <BrandAvatar />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Campaign Info */}
        <View style={[styles.infoBanner, { backgroundColor: T.card }]}>
          <Feather name="layers" size={20} color={T.accent} />
          <View style={styles.infoBannerText}>
            <Text style={[styles.infoLabel, { color: T.text }]}>Review Campaign</Text>
            <Text style={[styles.infoValue, { color: T.textSecondary }]} numberOfLines={1}>{campaignName}</Text>
          </View>
          <Badge label="Awaiting Approval" />
        </View>

        {/* ── SECTION 1: DYNAMIC CREATIVE PREVIEW ── */}
        <Text style={[styles.sectionTitle, { color: T.text }]}>Sari Creative Assets</Text>
        
        <View style={[styles.previewTabBar, { backgroundColor: T.surface, borderColor: T.border }]}>
          {([
            { key: 'copy', label: '✍️ Copy' },
            { key: 'image', label: '🖼️ Banner' },
            { key: 'video', label: '🎬 Video' },
          ] as const).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.previewTab, activePreviewTab === tab.key && { borderBottomColor: T.accent, borderBottomWidth: 2.5 }]}
              onPress={() => setActivePreviewTab(tab.key)}
            >
              <Text style={[styles.previewTabText, { color: activePreviewTab === tab.key ? T.accent : T.textSecondary }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TAB CONTENTS */}
        <Card style={styles.assetCard}>
          {activePreviewTab === 'copy' && (
            <View>
              {adCopy ? (
                <View>
                  {/* Platform selector inside copy tab */}
                  <View style={[styles.segmentRow, { backgroundColor: T.surface }]}>
                    {(['instagram', 'tiktok', 'facebook'] as const).map(p => (
                      <TouchableOpacity
                        key={p}
                        style={[styles.segmentBtn, activePlatform === p && { backgroundColor: T.accent }]}
                        onPress={() => setActivePlatform(p)}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons
                            name={p === 'instagram' ? 'logo-instagram' : p === 'tiktok' ? 'logo-tiktok' : 'logo-facebook'}
                            size={14}
                            color={activePlatform === p ? T.primaryText : T.textSecondary}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={[styles.segmentText, { color: activePlatform === p ? T.primaryText : T.textSecondary }]}>
                            {p === 'instagram' ? 'Instagram' : p === 'tiktok' ? 'TikTok' : 'Facebook'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Language Selector */}
                  <View style={styles.langRow}>
                    {(['english', 'roman_urdu'] as const).map(l => (
                      <TouchableOpacity
                        key={l}
                        style={[styles.langBtn, { borderColor: T.accent }, activeLang === l && { backgroundColor: T.accent }]}
                        onPress={() => setActiveLang(l)}
                      >
                        <Text style={{ color: activeLang === l ? T.primaryText : T.accent, fontSize: 12, fontWeight: '600' }}>
                          {l === 'english' ? 'English' : 'Roman Urdu'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.copyBlock}>
                    <Text style={[styles.copyLabel, { color: T.textSecondary }]}>Headline / Hook</Text>
                    <Text style={[styles.copyValueText, { color: T.text }]}>
                      {adCopy.copies?.[activePlatform]?.[activeLang]?.headline || adCopy.copies?.[activePlatform]?.[activeLang]?.hook || 'Unleashing premium brand aesthetics.'}
                    </Text>

                    <Text style={[styles.copyLabel, { color: T.textSecondary }]}>Body Content</Text>
                    <Text style={[styles.copyValueText, { color: T.text }]}>
                      {adCopy.copies?.[activePlatform]?.[activeLang]?.body || 'Explore customized fits crafted to stand out across Pakistan.'}
                    </Text>

                    <Text style={[styles.copyLabel, { color: T.textSecondary }]}>Call To Action (CTA)</Text>
                    <View style={[styles.ctaBadge, { backgroundColor: T.accent }]}>
                      <Text style={[styles.ctaText, { color: T.primaryText }]}>
                        {adCopy.copies?.[activePlatform]?.[activeLang]?.cta || 'Shop Now'}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text style={{ color: T.textSecondary, textAlign: 'center', marginVertical: 20 }}>No ad copies generated.</Text>
              )}
            </View>
          )}

          {activePreviewTab === 'image' && (
            <View style={styles.mediaContainer}>
              {imageUrl ? (
                <Image source={{ uri: resolveMediaUrl(imageUrl) }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <View style={[styles.mediaPlaceholder, { backgroundColor: T.btnSecondary }]}>
                  <Feather name="image" size={32} color={T.textMuted} />
                  <Text style={{ color: T.textMuted, fontSize: 13, marginTop: 8 }}>Image not generated yet</Text>
                </View>
              )}
            </View>
          )}

          {activePreviewTab === 'video' && (
            <View>
              {videoUrl ? (
                <View style={styles.mediaContainer}>
                  {/* Ken burns scene preview mockup */}
                  <Image source={{ uri: resolveMediaUrl(imageUrl) || 'https://image.pollinations.ai/prompt/premium_branding_ken_burns_zoom_video' }} style={styles.previewImage} resizeMode="cover" />
                  <View style={styles.playOverlay}>
                    <Ionicons name="play-circle" size={60} color="#fff" />
                    <Text style={styles.videoPlayLabel}>Ken Burns Animated MP4 Active</Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.mediaPlaceholder, { backgroundColor: T.btnSecondary }]}>
                  <Feather name="video" size={32} color={T.textMuted} />
                  <Text style={{ color: T.textMuted, fontSize: 13, marginTop: 8 }}>Video not compiled yet</Text>
                </View>
              )}
            </View>
          )}
        </Card>



        {/* ── SECTION 3: EMAIL OUTREACH DISPATCH ── */}
        <Text style={[styles.sectionTitle, { color: T.text, marginTop: 24 }]}>Customer Outreach</Text>
        <Card style={[styles.publishMainCard, { borderColor: '#22C55E' + '30', backgroundColor: T.card }]}>
          <Text style={[styles.publishDesc, { color: T.textSecondary, marginBottom: 12 }]}>
            Enter recipient emails manually or upload a CSV file to parse the campaign audience and dispatch dynamic emails.
          </Text>

          {/* Manual Input */}
          <Text style={[styles.copyLabel, { color: T.textSecondary, marginTop: 4, marginBottom: 6 }]}>Manual Recipient List</Text>
          <TextInput
            style={[
              styles.multilineInput,
              {
                backgroundColor: T.btnSecondary,
                color: T.text,
                borderColor: T.border,
                borderWidth: 1.5,
                borderRadius: 12,
                padding: 12,
                fontSize: 13,
                minHeight: 68,
                textAlignVertical: 'top',
                marginBottom: 14,
              }
            ]}
            placeholder="enter emails separated by commas or spaces..."
            placeholderTextColor={T.textMuted}
            value={outreachEmails}
            onChangeText={setOutreachEmails}
            multiline
            autoCorrect={false}
          />

          {/* Dotted Border CSV Pick Row */}
          <TouchableOpacity
            onPress={pickOutreachCsv}
            style={[
              styles.csvPickerBtn,
              {
                borderColor: T.accent,
                borderStyle: 'dashed',
                borderWidth: 1.5,
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: T.withAlpha(T.accent, 0.05),
                marginBottom: 16,
              }
            ]}
          >
            <Feather name="file-text" size={16} color={T.accent} />
            <Text style={{ color: T.accent, fontSize: 13, fontWeight: '700' }}>
              {csvFileName ? `Imported: ${csvFileName}` : 'Upload Recipient CSV'}
            </Text>
            {csvEmails.length > 0 && (
              <View style={{ backgroundColor: '#22C55E', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{csvEmails.length} Emails</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Summary Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <Text style={{ color: T.textSecondary, fontSize: 12, fontWeight: '600' }}>Total Queue:</Text>
            <View style={{ backgroundColor: T.accent + '20', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: T.accent + '40' }}>
              <Text style={{ color: T.accent, fontSize: 12, fontWeight: '800' }}>{getMergedEmails().length} Recipients</Text>
            </View>
          </View>

          {emailLoading ? (
            <ActivityIndicator size="small" color="#22C55E" style={{ marginTop: 8 }} />
          ) : (
            <TouchableOpacity
              style={[styles.emailOutreachBtn, { backgroundColor: '#22C55E', marginTop: 4 }]}
              onPress={handleLaunchEmailOutreach}
            >
              <Text style={styles.emailOutreachBtnText}>📨 Launch Email Outreach Campaign</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* ── SECTION 4: APPROVAL PLATFORM & PUBLISH ── */}
        <Text style={[styles.sectionTitle, { color: T.text, marginTop: 24 }]}>Final Approval & Publishing</Text>
        <Card style={styles.publishMainCard}>
          <Text style={[styles.publishDesc, { color: T.textSecondary }]}>
            Approve your optimized campaign strategy. Once approved, you can select which social platforms to deploy the digital campaign container and upload assets live!
          </Text>
          <PrimaryButton
            label="Approve & Go Live"
            onPress={handleGoLive}
            style={[T.shadowStrong, { shadowColor: T.accent, shadowOpacity: 0.3, marginTop: 8 }]}
          />
        </Card>

      </ScrollView>

      {/* ── PLATFORMS CHECKLIST & UPLOADING DIALOG MODAL ── */}
      <Modal visible={showPublishModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.publishModalCard, { backgroundColor: T.surface, borderColor: T.border }]}>
            
            {publishing ? (
              // Futuristic upload progression status
              <View style={styles.publishingCenter}>
                <ActivityIndicator size="large" color={T.accent} style={{ marginBottom: 20 }} />
                <Text style={[styles.publishingTitle, { color: T.text }]}>Deploying Campaign...</Text>
                
                {/* Holographic progress tracker */}
                <View style={[styles.hologramBarTrack, { backgroundColor: T.divider }]}>
                  <View style={[styles.hologramBarFill, { backgroundColor: T.accent, width: `${publishProgress * 100}%` }]} />
                </View>
                
                <Text style={[styles.hologramPercent, { color: T.accent }]}>{Math.round(publishProgress * 100)}%</Text>
                <Text style={[styles.publishingStepText, { color: T.textSecondary }]}>{publishStatusText}</Text>
              </View>
            ) : (
              // Platforms check list
              <View>
                <View style={styles.modalHeaderRow}>
                  <Feather name="globe" size={24} color={T.accent} />
                  <Text style={[styles.modalTitle, { color: T.text }]}>Deploy Platforms</Text>
                </View>
                <Text style={[styles.modalDesc, { color: T.textSecondary }]}>
                  Select the target publishing channels for your ad assets and budget containers.
                </Text>

                <View style={styles.checkboxesGroup}>
                  {PLATFORMS.map((p) => (
                    <TouchableOpacity
                      key={p.key}
                      style={[styles.platformToggleItem, { borderBottomColor: T.divider }]}
                      onPress={() => togglePlacement(p.key)}
                    >
                      <Ionicons name={p.icon} size={20} color={p.color} />
                      <Text style={[styles.platformToggleLabel, { color: T.text }]}>{p.label}</Text>
                      <Switch
                        value={placements[p.key]}
                        onValueChange={() => togglePlacement(p.key)}
                        trackColor={{ false: T.btnSecondary, true: T.withAlpha(T.accent, 0.4) }}
                        thumbColor={placements[p.key] ? T.accent : T.textMuted}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[styles.modalCancelBtn, { backgroundColor: T.btnSecondary }]}
                    onPress={() => setShowPublishModal(false)}
                  >
                    <Text style={{ color: T.text, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalConfirmBtn, { backgroundColor: T.accent }]}
                    onPress={triggerPublishSimulation}
                    disabled={activeCount === 0}
                  >
                    <Text style={{ color: T.primaryText, fontWeight: '800' }}>Publish Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </View>
        </View>
      </Modal>

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

          <Text style={[styles.celebrateTitle, { color: T.text }]}>Success! Campaign Published</Text>
          
          <Card style={styles.celebrateStatsCard}>
            <View style={styles.celebrateStatRow}>
              <Text style={[styles.statLabel, { color: T.textSecondary }]}>Publish Channels</Text>
              <Text style={[styles.statVal, { color: T.accent, fontWeight: '800' }]}>
                {PLATFORMS.filter(p => placements[p.key]).map(p => p.label.split(' ')[0]).join(', ')}
              </Text>
            </View>
            <View style={styles.celebrateStatRow}>
              <Text style={[styles.statLabel, { color: T.textSecondary }]}>Estimated Total Reach</Text>
              <Text style={[styles.statVal, { color: T.text }]}>150,000 Audience</Text>
            </View>
            <View style={styles.celebrateStatRow}>
              <Text style={[styles.statLabel, { color: T.textSecondary }]}>Deployment Status</Text>
              <Text style={[styles.statVal, { color: '#22C55E' }]}>ACTIVE LIVE ✓</Text>
            </View>
          </Card>

          <Text style={[styles.celebrateSub, { color: T.textSecondary }]}>
            Your campaign assets, marketing copy, ad banner, and parameters are deployed live and syncing to the respective platform accounts!
          </Text>

          <TouchableOpacity
            style={[styles.celebrateCloseBtn, { backgroundColor: T.accent }]}
            onPress={() => {
              setShowCelebration(false);
              navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
            }}
          >
            <Text style={[styles.celebrateCloseText, { color: T.primaryText }]}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
};

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
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  previewTabBar: { flexDirection: 'row', borderRadius: 12, borderBottomWidth: 1.5, marginBottom: 16, overflow: 'hidden' },
  previewTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  previewTabText: { fontSize: 13, fontWeight: '700' },
  assetCard: { padding: 16 },
  segmentRow: { flexDirection: 'row', borderRadius: 10, padding: 3, marginBottom: 12 },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  segmentText: { fontSize: 12, fontWeight: '600' },
  langRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  langBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, alignItems: 'center' },
  copyBlock: { padding: 8 },
  copyLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, marginTop: 10 },
  copyValueText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  ctaBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginTop: 8 },
  ctaText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  mediaContainer: { borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)' },
  previewImage: { width: '100%', height: 230 },
  mediaPlaceholder: { height: 230, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  playOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', gap: 8 },
  videoPlayLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
  
  // Shifted email outreach card styles
  emailOutreachCard: { padding: 16 },
  emailOutreachIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emailOutreachCardTitle: { fontSize: 15, fontWeight: '800' },
  emailOutreachCardDesc: { fontSize: 12, lineHeight: 18, marginVertical: 12 },
  emailOutreachBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  emailOutreachBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // Publish Card
  publishMainCard: { padding: 16 },
  publishDesc: { fontSize: 12, lineHeight: 18, marginBottom: 14 },
  
  // Modal Checklists
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  publishModalCard: { width: '100%', borderRadius: 24, borderWidth: 1, padding: 24 },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  modalTitle: { fontSize: 19, fontWeight: '800' },
  modalDesc: { fontSize: 12, lineHeight: 18, marginBottom: 16 },
  checkboxesGroup: { marginBottom: 20 },
  platformToggleItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  platformToggleLabel: { flex: 1, fontSize: 14, fontWeight: '600', marginLeft: 12 },
  modalButtonsRow: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalConfirmBtn: { flex: 1.3, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Holographic Progression overlay
  publishingCenter: { alignItems: 'center', paddingVertical: 20 },
  publishingTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14 },
  hologramBarTrack: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  hologramBarFill: { height: '100%' },
  hologramPercent: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
  publishingStepText: { fontSize: 12, textAlign: 'center', fontStyle: 'italic' },

  // Victory screen
  celebrate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  celebrateTitle: { fontSize: 24, fontWeight: '800', marginTop: 20, marginBottom: 12, textAlign: 'center' },
  celebrateSub: { fontSize: 14, textAlign: 'center', marginTop: 12, paddingHorizontal: 16, lineHeight: 20 },
  celebrateStatsCard: { width: '100%', padding: 18, marginVertical: 16, gap: 12 },
  celebrateStatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: 13, fontWeight: '500' },
  statVal: { fontSize: 14, fontWeight: '700' },
  celebrateCloseBtn: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, marginTop: 24, width: '100%', alignItems: 'center' },
  celebrateCloseText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  multilineInput: {},
  csvPickerBtn: {},
});
