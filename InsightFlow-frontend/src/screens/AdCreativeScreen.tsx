import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  Animated, StyleSheet, ActivityIndicator, Linking
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAuthStore } from '../store/userStore';
import { Ionicons } from '@expo/vector-icons';
import {
  generateAdCopyApi,
  generateAdImageApi,
  generateAdVideoApi,
  BASE_URL
} from '../api/api';
import { BrandAvatar } from '../components/BrandLogo';

export default function AdCreativeScreen({ route, navigation }: any) {
  const { campaign_id, campaign_name, customizations } = route.params || {};
  const T = useTheme();
  const token = useAuthStore(state => state.token);

  const [activeTab, setActiveTab] = useState<'copy' | 'image' | 'video'>('copy');
  const [adCopy, setAdCopy] = useState<any>(null);
  const [adImages, setAdImages] = useState<Record<string, any>>({});
  const [adVideo, setAdVideo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [activePlatform, setActivePlatform] = useState<'instagram' | 'tiktok' | 'facebook'>('instagram');
  const [activeLang, setActiveLang] = useState<'english' | 'roman_urdu'>('english');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 500, useNativeDriver: true
    }).start();
  }, []);

  // ── AD COPY TAB ──────────────────────────────────────

  const handleGenerateCopy = async () => {
    setLoading(true);
    setLoadingMsg('AI is crafting Gen-Z ad copies...');
    try {
      const result = await generateAdCopyApi(
        token!,
        campaign_id,
        customizations?.tone,
        customizations?.targetAge,
        customizations?.offer,
        customizations?.extraMessage
      );
      setAdCopy(result);
    } catch (e: any) {
      alert('Ad copy generation failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const CopyTab = () => {
    const platformData = adCopy?.copies?.[activePlatform]?.[activeLang];

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
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
                  size={16}
                  color={activePlatform === p ? '#fff' : T.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.segmentText, { color: activePlatform === p ? '#fff' : T.textSecondary }]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Language Toggle */}
        <View style={[styles.langRow]}>
          {(['english', 'roman_urdu'] as const).map(l => (
            <TouchableOpacity
              key={l}
              style={[styles.langBtn, { borderColor: T.accent }, activeLang === l && { backgroundColor: T.accent }]}
              onPress={() => setActiveLang(l)}
            >
              <Text style={{ color: activeLang === l ? '#fff' : T.accent, fontWeight: '600' }}>
                {l === 'english' ? 'English' : 'Roman Urdu'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Copy Content */}
        {platformData ? (
          <Animated.View style={[styles.copyCard, { backgroundColor: T.card, opacity: fadeAnim }]}>
            <Text style={[styles.copyLabel, { color: T.textSecondary }]}>Headline</Text>
            <Text style={[styles.copyHeadline, { color: T.text }]}>{platformData.headline || platformData.hook}</Text>

            <Text style={[styles.copyLabel, { color: T.textSecondary }]}>Body Copy</Text>
            <Text style={[styles.copyBody, { color: T.text }]}>{platformData.body}</Text>

            <Text style={[styles.copyLabel, { color: T.textSecondary }]}>CTA</Text>
            <View style={[styles.ctaBadge, { backgroundColor: T.accent }]}>
              <Text style={styles.ctaText}>{platformData.cta}</Text>
            </View>

            {platformData.hashtags?.length > 0 && (
              <>
                <Text style={[styles.copyLabel, { color: T.textSecondary }]}>Hashtags</Text>
                <View style={styles.hashtagRow}>
                  {platformData.hashtags.map((h: string, i: number) => (
                    <View key={i} style={[styles.hashtagChip, { backgroundColor: T.accent + '22' }]}>
                      <Text style={[styles.hashtagText, { color: T.accent }]}>{h}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {adCopy?.best_posting_times?.[activePlatform] && (
              <View style={[styles.timingCard, { backgroundColor: T.surface }]}>
                <Text style={[styles.timingLabel, { color: T.textSecondary }]}>⏰ Best Time to Post</Text>
                <Text style={[styles.timingValue, { color: T.text }]}>
                  {adCopy.best_posting_times[activePlatform]}
                </Text>
              </View>
            )}
          </Animated.View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: T.textSecondary }]}>
              Generate professional ad copies for all platforms
            </Text>
            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: T.accent }]}
              onPress={handleGenerateCopy}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.generateBtnText}>✨ Generate Ad Copies</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {adCopy && (
          <TouchableOpacity
            style={[styles.regenerateBtn, { borderColor: T.accent }]}
            onPress={handleGenerateCopy}
          >
            <Text style={[styles.regenerateBtnText, { color: T.accent }]}>🔄 Regenerate</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  // ── AD IMAGE TAB ─────────────────────────────────────

  const handleGenerateImage = async (platform: 'instagram' | 'tiktok' | 'facebook') => {
    setLoading(true);
    setLoadingMsg(`Creating ${platform} banner with AI...`);
    try {
      const result = await generateAdImageApi(token!, campaign_id, platform);
      setAdImages(prev => ({ ...prev, [platform]: result }));
    } catch (e: any) {
      alert('Image generation failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const ImageTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: T.text }]}>AI Generated Ad Banner</Text>
      <Text style={[styles.sectionSubtitle, { color: T.textSecondary }]}>
        Powered by Pollinations AI — contextual to your campaign
      </Text>

      <View style={[styles.imagePlatformCard, { backgroundColor: T.card }]}>
        <View style={styles.imagePlatformHeader}>
          <Text style={[styles.imagePlatformName, { color: T.text }]}>
            ✨ Universal Ad Banner
          </Text>
          <Text style={[styles.imageDimension, { color: T.textSecondary }]}>
            1080×1080 Square Format
          </Text>
        </View>

        {adImages['instagram'] ? (
          <View>
            <Image
              source={{ uri: adImages['instagram'].image_url }}
              style={styles.adImagePreview}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={[styles.downloadBtn, { backgroundColor: T.accent }]}
              onPress={() => Linking.openURL(adImages['instagram'].image_url)}
            >
              <Text style={styles.downloadBtnText}>⬇️ Download</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.regenerateBtn, { borderColor: T.accent }]}
              onPress={() => handleGenerateImage('instagram')}
            >
              <Text style={[styles.regenerateBtnText, { color: T.accent }]}>🔄 Regenerate Banner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.generateImageBtn, { backgroundColor: T.accent + '22', borderColor: T.accent }]}
            onPress={() => handleGenerateImage('instagram')}
            disabled={loading}
          >
            {loading && loadingMsg.includes('instagram') ? (
              <ActivityIndicator color={T.accent} />
            ) : (
              <Text style={[styles.generateImageBtnText, { color: T.accent }]}>
                ✨ Generate Ad Creative Banner
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  // ── AD VIDEO TAB ─────────────────────────────────────

  const handleGenerateVideo = async () => {
    setLoading(true);
    setLoadingMsg('Creating animated ad video... this takes ~30 seconds');
    try {
      const result = await generateAdVideoApi(token!, campaign_id);
      setAdVideo(result);
    } catch (e: any) {
      alert('Video generation failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const VideoTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: T.text }]}>AI Generated Ad Video</Text>
      <Text style={[styles.sectionSubtitle, { color: T.textSecondary }]}>
        9-second animated MP4 — brand colors + campaign content
      </Text>

      {adVideo?.video_generated ? (
        <View style={[styles.videoCard, { backgroundColor: T.card }]}>
          <Text style={[styles.videoReady, { color: '#22C55E' }]}>✅ Video Ready!</Text>
          <Text style={[styles.videoMeta, { color: T.textSecondary }]}>
            Format: {adVideo.format} • Duration: {adVideo.duration_seconds}s
          </Text>

          {/* Frame previews */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.frameRow}>
            {adVideo.frame_images?.map((url: string, i: number) => (
              <View key={i} style={styles.frameContainer}>
                <Image source={{ uri: url }} style={styles.frameThumb} resizeMode="cover" />
                <Text style={[styles.frameLabel, { color: T.textSecondary }]}>Scene {i + 1}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Scene breakdown */}
          {adVideo.scenes?.map((scene: any, i: number) => (
            <View key={i} style={[styles.sceneRow, { borderColor: T.border }]}>
              <Text style={[styles.sceneDuration, { color: T.accent }]}>{scene.duration}</Text>
              <Text style={[styles.sceneContent, { color: T.text }]}>{scene.content}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.downloadBtn, { backgroundColor: T.accent }]}
            onPress={() => Linking.openURL(`${BASE_URL}${adVideo.video_url}`)}
          >
            <Text style={styles.downloadBtnText}>⬇️ Download MP4</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: T.textSecondary }]}>
            Generate a 9-second animated video ad with your brand colors and campaign content
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={T.accent} />
              <Text style={[styles.loadingMsg, { color: T.textSecondary }]}>{loadingMsg}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: T.accent }]}
              onPress={handleGenerateVideo}
            >
              <Text style={styles.generateBtnText}>🎬 Generate Video Ad</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );

  // ── MAIN RENDER ──────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity style={styles.backBtnTouch} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={T.accent} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: T.text }]}>Ad Creatives</Text>
          <Text style={[styles.headerSub, { color: T.textSecondary }]} numberOfLines={1}>
            {campaign_name}
          </Text>
        </View>
        <BrandAvatar />
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: T.surface, borderBottomColor: T.border }]}>
        {([
          { key: 'copy', label: '✍️ Copy' },
          { key: 'image', label: '🖼️ Images' },
          { key: 'video', label: '🎬 Video' },
        ] as const).map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: T.accent, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? T.accent : T.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'copy' && <CopyTab />}
        {activeTab === 'image' && <ImageTab />}
        {activeTab === 'video' && <VideoTab />}
      </View>

      {(adCopy || adImages['instagram'] || adVideo) && (
        <TouchableOpacity
          style={[styles.outreachCtaBtn, { backgroundColor: T.accent }]}
          onPress={() => navigation.navigate('Publish', {
            campaign_id: campaign_id || 'demo-campaign-id',
            campaign_name: campaign_name,
            ad_copy: adCopy,
            image_url: adImages['instagram']?.image_url || '',
            video_url: adVideo?.video_url || '',
          })}
        >
          <Text style={styles.outreachCtaText}>Review & Go Live →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnTouch: { paddingRight: 12 },
  headerTitles: { flex: 1 },
  headerTitle: { fontSize: 19, fontWeight: '800' },
  headerSub: { fontSize: 11, marginTop: 2 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  segmentRow: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 12 },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  segmentText: { fontSize: 12, fontWeight: '600' },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  langBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, alignItems: 'center' },
  copyCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  copyLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 12, marginBottom: 4 },
  copyHeadline: { fontSize: 20, fontWeight: '800', lineHeight: 28 },
  copyBody: { fontSize: 15, lineHeight: 22 },
  ctaBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  hashtagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  hashtagChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  hashtagText: { fontSize: 12, fontWeight: '600' },
  timingCard: { marginTop: 16, padding: 12, borderRadius: 10 },
  timingLabel: { fontSize: 11, fontWeight: '600' },
  timingValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 16 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  generateBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  generateBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  regenerateBtn: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginTop: 8 },
  regenerateBtnText: { fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, marginBottom: 16 },
  imagePlatformCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  imagePlatformHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  imagePlatformName: { fontSize: 16, fontWeight: '700' },
  imageDimension: { fontSize: 12 },
  adImagePreview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },
  generateImageBtn: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  generateImageBtnText: { fontWeight: '700', fontSize: 15 },
  downloadBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  downloadBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  videoCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  videoReady: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  videoMeta: { fontSize: 13, marginBottom: 16 },
  frameRow: { marginBottom: 16 },
  frameContainer: { marginRight: 12, alignItems: 'center' },
  frameThumb: { width: 100, height: 100, borderRadius: 10 },
  frameLabel: { fontSize: 11, marginTop: 4 },
  sceneRow: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 10, gap: 12 },
  sceneDuration: { fontWeight: '700', fontSize: 13, width: 36 },
  sceneContent: { flex: 1, fontSize: 13 },
  loadingContainer: { alignItems: 'center', gap: 12 },
  loadingMsg: { fontSize: 13, textAlign: 'center' },
  outreachCtaBtn: {
    marginHorizontal: 16,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  outreachCtaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
