import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useCampaignStore } from '../store/campaignStore';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../theme/useTheme';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BrandAvatar } from '../components/BrandLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CampaignReviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const T = useTheme();
  
  // Retrieve route params or fallback to empty
  const { campaign_id, campaign_name: routeCampaignName } = route.params || {};

  // Store data
  const { user, userProfile } = useUserStore();
  const { strategy, budget, contradictions } = useCampaignStore();

  // Campaign data fallback and resolution
  const resolvedCampaignName = useMemo(() => {
    return routeCampaignName || strategy?.campaign_name || (userProfile?.business_name ? `${userProfile.business_name} Season Campaign` : 'My Premium Campaign');
  }, [routeCampaignName, strategy, userProfile]);

  const resolvedTheme = useMemo(() => {
    return strategy?.summary || 'Engage target audiences across visual platforms with premium digital creatives.';
  }, [strategy]);

  const solvedProblems = useMemo(() => {
    if (contradictions && contradictions.length > 0) {
      return contradictions.map((c: any) => {
        return typeof c === 'object' ? (c.title || c.description || String(c)) : String(c);
      });
    }
    return [
      'Inventory Risk & Overstocking',
      'Negative Delivery Reviews & Sentiment Drift',
      'High Customer Acquisition Costs (CAC)'
    ];
  }, [contradictions]);

  const displayBudget = budget || 15000;

  // Customization Form States
  const [selectedTone, setSelectedTone] = useState<string>('Professional');
  const [selectedAge, setSelectedAge] = useState<string>('18-25');
  const [specialOffer, setSpecialOffer] = useState<string>('');
  const [extraMessage, setExtraMessage] = useState<string>('');

  const tones = ['Professional', 'Fun & Playful', 'Urgent/Sale', 'Inspirational'];
  const ageGroups = ['13-18', '18-25', '25-35', '35+', 'All Ages'];

  const handleGenerate = () => {
    navigation.navigate('AdCreative', {
      campaign_id: campaign_id || 'demo-campaign-id',
      campaign_name: resolvedCampaignName,
      customizations: {
        tone: selectedTone,
        targetAge: selectedAge,
        offer: specialOffer,
        extraMessage: extraMessage,
      }
    });
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
          <Text style={[styles.headerTitle, { color: T.text }]}>Your Campaign Plan</Text>
          <Text style={[styles.headerSub, { color: T.textSecondary }]}>Review overview & customize ad prompt</Text>
        </View>
        <BrandAvatar />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* ── CAMPAIGN OVERVIEW ── */}
        <SectionHeader title="Campaign Overview" subtitle="High-level identity" />
        <Card style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Feather name="activity" size={20} color={T.accent} />
            <Text style={[styles.campaignName, { color: T.text }]}>{resolvedCampaignName}</Text>
          </View>
          <Text style={[styles.campaignTheme, { color: T.textSecondary }]}>
            {resolvedTheme}
          </Text>
        </Card>

        {/* ── TARGET PROBLEMS BEING SOLVED ── */}
        <SectionHeader title="Target Conflicts Addressed" subtitle="Data issues resolved by this run" />
        <Card style={styles.problemsCard}>
          <View style={styles.chipsContainer}>
            {solvedProblems.map((p, index) => (
              <View key={index} style={[styles.chip, { backgroundColor: T.accent + '15', borderColor: T.accent + '30' }]}>
                <Ionicons name="checkmark-circle-outline" size={14} color={T.accent} />
                <Text style={[styles.chipText, { color: T.text }]}>
                  {p}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* ── RECOMMENDED BUDGET BREAKDOWN ── */}
        <SectionHeader title="Budget Allocation" subtitle="Channel distribution based on efficiency metrics" />
        <Card style={styles.budgetCard}>
          <Text style={[styles.budgetLabel, { color: T.textSecondary }]}>Total PKRs Budget</Text>
          <Text style={[styles.budgetValue, { color: T.accent }]}>PKR {displayBudget.toLocaleString()}</Text>
          
          <View style={styles.budgetBar}>
            <View style={[styles.budgetSegment, { width: '40%', backgroundColor: T.accent }]} />
            <View style={[styles.budgetSegment, { width: '35%', backgroundColor: '#22C55E' }]} />
            <View style={[styles.budgetSegment, { width: '25%', backgroundColor: '#F59E0B' }]} />
          </View>

          <View style={styles.budgetDetails}>
            <View style={styles.platformBudgetRow}>
              <Ionicons name="logo-instagram" size={16} color="#E1306C" style={{ marginRight: 6 }} />
              <Text style={[styles.platformName, { color: T.text }]}>Instagram (40%)</Text>
              <Text style={[styles.platformVal, { color: T.textSecondary }]}>PKR {Math.floor(displayBudget * 0.4).toLocaleString()}</Text>
            </View>
            <View style={styles.platformBudgetRow}>
              <Ionicons name="logo-tiktok" size={16} color={T.text} style={{ marginRight: 6 }} />
              <Text style={[styles.platformName, { color: T.text }]}>TikTok (35%)</Text>
              <Text style={[styles.platformVal, { color: T.textSecondary }]}>PKR {Math.floor(displayBudget * 0.35).toLocaleString()}</Text>
            </View>
            <View style={styles.platformBudgetRow}>
              <Ionicons name="logo-facebook" size={16} color="#1877F2" style={{ marginRight: 6 }} />
              <Text style={[styles.platformName, { color: T.text }]}>Facebook (25%)</Text>
              <Text style={[styles.platformVal, { color: T.textSecondary }]}>PKR {Math.floor(displayBudget * 0.25).toLocaleString()}</Text>
            </View>
          </View>
        </Card>

        {/* ── EXPECTED OUTCOMES ── */}
        <SectionHeader title="Expected Outcomes" subtitle="Forecasted results (30 days run)" />
        <View style={styles.outcomesGrid}>
          <Card style={styles.outcomeCell}>
            <Ionicons name="people" size={20} color={T.accent} style={{ marginBottom: 4 }} />
            <Text style={[styles.outcomeVal, { color: T.text }]}>{(displayBudget * 2.5).toLocaleString()}</Text>
            <Text style={[styles.outcomeLabel, { color: T.textSecondary }]}>Estimated Reach</Text>
          </Card>
          <Card style={styles.outcomeCell}>
            <Ionicons name="chatbubbles" size={20} color="#22C55E" style={{ marginBottom: 4 }} />
            <Text style={[styles.outcomeVal, { color: T.text }]}>{Math.floor(displayBudget * 0.06).toLocaleString()}</Text>
            <Text style={[styles.outcomeLabel, { color: T.textSecondary }]}>Estimated Leads</Text>
          </Card>
          <Card style={styles.outcomeCell}>
            <Ionicons name="cash" size={20} color="#F59E0B" style={{ marginBottom: 4 }} />
            <Text style={[styles.outcomeVal, { color: T.text }]}>PKR {(displayBudget * 3.8).toLocaleString()}</Text>
            <Text style={[styles.outcomeLabel, { color: T.textSecondary }]}>Est. Revenue</Text>
          </Card>
          <Card style={styles.outcomeCell}>
            <Ionicons name="trending-up" size={20} color="#A855F7" style={{ marginBottom: 4 }} />
            <Text style={[styles.outcomeVal, { color: T.text }]}>280%</Text>
            <Text style={[styles.outcomeLabel, { color: T.textSecondary }]}>Target ROI</Text>
          </Card>
        </View>

        {/* ── PLATFORM BREAKDOWN CARDS ── */}
        <SectionHeader title="Platform Breakdown" subtitle="Target channels strategy" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformCardsScroll}>
          <Card style={styles.platformCard}>
            <View style={styles.platformHeader}>
              <Ionicons name="logo-instagram" size={28} color="#E1306C" style={{ marginRight: 4 }} />
              <View>
                <Text style={[styles.platformTitle, { color: T.text }]}>Instagram Ads</Text>
                <Text style={[styles.platformSub, { color: T.textSecondary }]}>Visual storytelling</Text>
              </View>
            </View>
            <Text style={[styles.platformDesc, { color: T.textSecondary }]}>
              Focus on highly polished product aesthetic, Reels hooks, and brand slogans to engage premium buyers.
            </Text>
          </Card>
          <Card style={styles.platformCard}>
            <View style={styles.platformHeader}>
              <Ionicons name="logo-tiktok" size={28} color={T.text} style={{ marginRight: 4 }} />
              <View>
                <Text style={[styles.platformTitle, { color: T.text }]}>TikTok Ads</Text>
                <Text style={[styles.platformSub, { color: T.textSecondary }]}>Short scroll-stopping hooks</Text>
              </View>
            </View>
            <Text style={[styles.platformDesc, { color: T.textSecondary }]}>
              Focus on authentic Gen-Z vibes, energetic audio trends, and interactive discount tags.
            </Text>
          </Card>
          <Card style={styles.platformCard}>
            <View style={styles.platformHeader}>
              <Ionicons name="logo-facebook" size={28} color="#1877F2" style={{ marginRight: 4 }} />
              <View>
                <Text style={[styles.platformTitle, { color: T.text }]}>Facebook Feed</Text>
                <Text style={[styles.platformSub, { color: T.textSecondary }]}>Detailed conversion copy</Text>
              </View>
            </View>
            <Text style={[styles.platformDesc, { color: T.textSecondary }]}>
              Focus on informational trust, clear product value statements, and solid discount call-to-actions.
            </Text>
          </Card>
        </ScrollView>

        {/* ── CUSTOMIZE BEFORE CREATING ADS ── */}
        <SectionHeader title="Customize Before Creating Ads" subtitle="Tune the Gen-Z copywriting engine" />
        <Card style={styles.customCard}>
          {/* Tone Selector */}
          <Text style={[styles.formLabel, { color: T.text }]}>Campaign Tone</Text>
          <View style={styles.formChips}>
            {tones.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.formChip,
                  { borderColor: T.accent },
                  selectedTone === t && { backgroundColor: T.accent }
                ]}
                onPress={() => setSelectedTone(t)}
              >
                <Text style={[styles.formChipText, { color: selectedTone === t ? '#fff' : T.accent }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Age Selector */}
          <Text style={[styles.formLabel, { color: T.text }]}>Target Age Group</Text>
          <View style={styles.formChips}>
            {ageGroups.map((a) => (
              <TouchableOpacity
                key={a}
                style={[
                  styles.formChip,
                  { borderColor: T.accent },
                  selectedAge === a && { backgroundColor: T.accent }
                ]}
                onPress={() => setSelectedAge(a)}
              >
                <Text style={[styles.formChipText, { color: selectedAge === a ? '#fff' : T.accent }]}>
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Discount Input */}
          <Text style={[styles.formLabel, { color: T.text }]}>Special Offer / Discount</Text>
          <TextInput
            style={[styles.input, { borderColor: T.border, color: T.text, backgroundColor: T.btnSecondary }]}
            placeholder="e.g. 20% off, Buy 1 Get 1"
            placeholderTextColor={T.textMuted}
            value={specialOffer}
            onChangeText={setSpecialOffer}
            autoCorrect={false}
          />

          {/* Specific message input */}
          <Text style={[styles.formLabel, { color: T.text }]}>Specific Message to Include</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { borderColor: T.border, color: T.text, backgroundColor: T.btnSecondary }]}
            placeholder="Anything specific or any key terms to feature in the ads copy?"
            placeholderTextColor={T.textMuted}
            value={extraMessage}
            onChangeText={setExtraMessage}
            multiline
            numberOfLines={3}
            autoCorrect={false}
          />
        </Card>

        {/* ── GENERATE CTA BUTTON ── */}
        <TouchableOpacity
          style={[styles.generateBtn, { backgroundColor: T.accent }]}
          onPress={handleGenerate}
        >
          <Text style={styles.generateBtnText}>🎨 Generate All Ad Creatives</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingRight: 10,
  },
  headerTitles: {
    flex: 1,
    paddingLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  scroll: { padding: 20, paddingBottom: 50 },
  overviewCard: { padding: 18, marginBottom: 12 },
  overviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  campaignName: { fontSize: 16, fontWeight: '700', flex: 1 },
  campaignTheme: { fontSize: 13, lineHeight: 18 },
  problemsCard: { padding: 16, marginBottom: 12 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '600', maxWidth: SCREEN_WIDTH - 120, flexShrink: 1 },
  budgetCard: { padding: 20, marginBottom: 12 },
  budgetLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  budgetValue: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  budgetBar: { height: 10, borderRadius: 5, overflow: 'hidden', flexDirection: 'row', marginBottom: 16 },
  budgetSegment: { height: '100%' },
  budgetDetails: { gap: 10 },
  platformBudgetRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  platformName: { fontSize: 13, flex: 1, fontWeight: '600' },
  platformVal: { fontSize: 13, fontWeight: '700' },
  outcomesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  outcomeCell: { width: (SCREEN_WIDTH - 52) / 2, padding: 14, borderRadius: 12 },
  outcomeVal: { fontSize: 18, fontWeight: '800', marginVertical: 2 },
  outcomeLabel: { fontSize: 11, fontWeight: '500' },
  platformCardsScroll: { marginBottom: 16 },
  platformCard: { width: 260, padding: 16, marginRight: 12 },
  platformHeader: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  platformIcon: { fontSize: 24 },
  platformTitle: { fontSize: 14, fontWeight: '700' },
  platformSub: { fontSize: 11 },
  platformDesc: { fontSize: 12, lineHeight: 18 },
  customCard: { padding: 20, marginBottom: 20 },
  formLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 10 },
  formChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  formChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  formChipText: { fontSize: 13, fontWeight: '700' },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  generateBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
