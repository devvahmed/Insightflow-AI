import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useCampaignStore } from '../store/campaignStore';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../theme/useTheme';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { BrandAvatar } from '../components/BrandLogo';

export const StrategyScreen = () => {
  const navigation = useNavigation<any>();
  const T = useTheme();
  
  // Data stores
  const { strategy, contradictions } = useCampaignStore();
  const { user, userProfile } = useUserStore();

  // 1. What AI Recommends (Strategy Cards)
  const strategies = useMemo(() => {
    if (strategy?.action_chain?.length) {
      return strategy.action_chain.map((a: any, i: number) => ({
        id: String(i),
        title: a.name || 'Strategic Action',
        body: a.description || '',
        channel: a.channel || 'Multi-channel',
      }));
    }
    return [
      { id: '1', title: 'Flash Counter-Promotions', body: 'Deploy target flash sales on high-converting product categories.', channel: 'Instagram' },
      { id: '2', title: 'Fulfillment Acceleration', body: 'Transition logistics to local express dispatch hubs.', channel: 'Operations' },
      { id: '3', title: 'Sentiment Rebound', body: 'Automate post-delivery customer satisfaction vouchers.', channel: 'WhatsApp' },
    ];
  }, [strategy]);



  // 3. Pakistan Trends to Ride
  const trendsList = useMemo(() => {
    return [
      { id: '1', title: 'Gen-Z Roman Urdu Slang', details: 'Ride the viral "Scene on kar" and "Fire hai" hooks in short reels.' },
      { id: '2', title: 'Seasonal Wave', details: 'Prepare clearance offers and mid-season launch hooks.' },
      { id: '3', title: 'Bestie wala Deal', details: 'Engage audience using peer recommendation and buy-one-get-one offers.' }
    ];
  }, []);

  // 4. Your Winning Angle
  const winningAngle = useMemo(() => {
    return strategy?.summary || 'Leverage strict quality guarantees and instant free shipping across Karachi & Lahore to naturally counter competitor discounts.';
  }, [strategy]);

  const campaignName = useMemo(() => {
    return strategy?.campaign_name || (userProfile?.business_name ? `${userProfile.business_name} Season Campaign` : 'Active Campaign Drive');
  }, [strategy, userProfile]);

  const campaignTheme = useMemo(() => {
    return strategy?.campaign_theme || 'Multi-channel digital expansion campaign to eliminate overstock and raise organic engagement.';
  }, [strategy, userProfile]);

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />
      
      {/* ── HEADER ── */}
      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={T.accent} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: T.text }]}>Strategy Plan</Text>
          <Text style={[styles.headerSub, { color: T.textSecondary }]}>{campaignTheme}</Text>
        </View>
        <BrandAvatar />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── 1. WHAT AI RECOMMENDS ── */}
        <SectionHeader title="Strategic Recommendations" subtitle="Action steps based on analytical anomalies" />
        {strategies.map((s, i) => (
          <Card key={s.id} animated delay={i * 60} style={styles.cardMargin}>
            <View style={styles.cardHead}>
              <Feather name="activity" size={18} color={T.accent} />
              <Text style={[styles.cardTitle, { color: T.text }]}>{s.title}</Text>
            </View>
            <Text style={[styles.cardBody, { color: T.textSecondary }]}>{s.body}</Text>
            <View style={styles.cardFoot}>
              <Badge label={s.channel} />
            </View>
          </Card>
        ))}



        {/* ── 3. PAKISTAN TRENDS TO RIDE ── */}
        <SectionHeader title="Pakistan Trends to Ride" subtitle="Social waves currently driving engagement" />
        {trendsList.map((t, i) => (
          <Card key={t.id} animated delay={i * 60} style={styles.cardMargin}>
            <View style={styles.cardHead}>
              <Feather name="trending-up" size={18} color="#22C55E" />
              <Text style={[styles.cardTitle, { color: T.text }]}>{t.title}</Text>
            </View>
            <Text style={[styles.cardBody, { color: T.textSecondary }]}>{t.details}</Text>
          </Card>
        ))}

        {/* ── 4. YOUR WINNING ANGLE ── */}
        <SectionHeader title="Your Winning Angle" subtitle="AI positioning synthesis" />
        <Card style={[styles.angleCard, T.glassCard, { borderColor: T.withAlpha(T.accent, 0.25), paddingVertical: 18, paddingHorizontal: 18 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
            <View style={{ width: 4, backgroundColor: T.accent, borderRadius: 2, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <View style={styles.cardHead}>
                <Ionicons name="sparkles" size={18} color={T.accent} />
                <Text style={[styles.angleTitle, { color: T.text, marginLeft: 6 }]}>Unique Campaign Hook</Text>
              </View>
              <Text style={[styles.angleBody, { color: T.textSecondary, marginTop: 4 }]}>
                {winningAngle}
              </Text>
            </View>
          </View>
        </Card>

        {/* ── CTA BUTTON ── */}
        <PrimaryButton
          label="🎨 Create Ad Creatives"
          onPress={() => navigation.navigate('CampaignReview', {
            campaign_id: strategy?.campaign_id || 'demo-campaign-id',
            campaign_name: campaignName,
          })}
          style={{ marginTop: 10, marginBottom: 20 }}
        />
      </ScrollView>
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
  scroll: { padding: 20, paddingBottom: 40 },
  cardMargin: {
    marginBottom: 12,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  angleCard: {
    padding: 18,
    borderWidth: 1.5,
    borderRadius: 14,
    marginBottom: 20,
  },
  angleTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  angleBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  adCreativeBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  adCreativeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
