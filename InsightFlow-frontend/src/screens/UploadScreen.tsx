import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useCampaignStore } from '../store/campaignStore';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../theme/useTheme';
import { analyzeData } from '../api/api';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SecondaryButton } from '../components/ui/SecondaryButton';
import { BrandAvatar } from '../components/BrandLogo';

export const UploadScreen = () => {
  const navigation = useNavigation<any>();
  const T = useTheme();
  const userProfile = useUserStore((s) => s.userProfile);
  const token = useUserStore((s) => s.token);
  const setAnalysis = useUserStore((s) => s.setAnalysis);
  const { setInputData, setScenario, setAnalysisResult, budget, setJobId, businessLevel, setBudget } =
    useCampaignStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [salesCsvFile, setSalesCsvFile] = useState<any>(null);
  const [manualSalesText, setManualSalesText] = useState('');
  const [socialComments, setSocialComments] = useState('');
  const [inventoryStock, setInventoryStock] = useState(8500);
  const [inventoryEditing, setInventoryEditing] = useState(false);
  const [marketingSpend, setMarketingSpend] = useState('150000');
  const [manualLeadsText, setManualLeadsText] = useState('');

  useEffect(() => {
    if (userProfile?.email === 'demo-retail@insightflow-ai.tech') {
      setManualSalesText(
        `Week,Sales_PKR,Transactions,Average_Order_Value,Units_Sold\nWeek 1,8500000,1700,5000,2100\nWeek 2,9800000,1960,5000,2450\nWeek 3,7900000,1580,5000,1900\nWeek 4,11200000,2150,5209,2800`
      );
      setSocialComments(
        `"Found a rare vintage camera on eBay that wasn't available anywhere on Daraz. Shipping took time but totally worth it!"\n"The delivery charges to Karachi are quite high compared to AliExpress. Wish there were better localized shipping rates."\n"Excellent buying experience! The seller feedback rating system makes it so much safer to buy refurbished electronics."\n"Customs clearance took an extra week at the airport. The app dashboard should include a customs duty estimator."\n"Bidding on auction items is so addictive! Secured a great deal on a graphic tablet today."`
      );
      setInventoryStock(14200);
      setMarketingSpend('55000');
      setManualLeadsText('Fashion-forward youth, Gen-Z retail shoppers, and vintage tech collectors in Karachi & Lahore.');
    } else if (userProfile?.email === 'demo-fintech@insightflow-ai.tech') {
      setManualSalesText(
        `Week,Sales_PKR,Transactions,Average_Order_Value,Units_Sold\nWeek 1,15500000,5100,3039,4800\nWeek 2,18200000,5680,3204,5400\nWeek 3,14900000,4950,3010,4650\nWeek 4,21000000,6560,3201,6100`
      );
      setSocialComments(
        `"The new HBL Mobile app update is so smooth! Love the biometric login feature. 5 stars!"\n"Tried transferring funds to a Meezan Bank account, but the transaction kept failing due to a system timeout."\n"Customer service helpline waiting time was over 15 minutes today. Highly frustrating when dealing with urgent card issues."\n"HBL Asaan Account features are great for students, but I think UBL offers slightly better digital discount vouchers."\n"The branch staff at the main highway location was extremely helpful with my home loan documentation."`
      );
      setInventoryStock(24500);
      setMarketingSpend('750000');
      setManualLeadsText('Digital banking app users, active credit card holders, and student accounts across Pakistan.');
    }
  }, [userProfile]);

  const sectionComplete = [
    !!(salesCsvFile || manualSalesText.trim()),
    !!socialComments.trim(),
    inventoryStock > 0,
    !!marketingSpend.trim(),
    !!manualLeadsText.trim(),
  ];

  const allComplete = sectionComplete.every(Boolean);

  const pickSalesCsv = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) setSalesCsvFile(result.assets[0]);
  };

  const handleAnalyze = async () => {
    if (!allComplete || !token) {
      if (!token) setError('Please log in again to run analysis.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const finalCsv =
        salesCsvFile?.name ? `Loaded: ${salesCsvFile.name}` : manualSalesText;
      const inputs = {
        csv_sales_data: finalCsv,
        pdf_report: `Inventory: ${inventoryStock} units. Marketing PKR ${marketingSpend}`,
        news_text: manualLeadsText.slice(0, 1000),
        social_posts: socialComments,
        web_url: userProfile?.website_url || 'https://example.com',
      };
      setInputData(inputs);
      setScenario((userProfile?.business_name || 'Brand') + ' Analysis');
      const jobId = 'JOB-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      setJobId(jobId);
      const parsedSpend = parseFloat(marketingSpend.replace(/,/g, '')) || 150000;
      setBudget(parsedSpend);
      
      const response = await analyzeData(
        jobId,
        inputs,
        parsedSpend,
        businessLevel,
        userProfile?.business_name,
        userProfile?.brand_color,
        ''
      );
      setAnalysis(response);
      const agent1 = response.agent1_data || {};
      setAnalysisResult(
        agent1.insights || response.positive_signals || [],
        agent1.contradictions || response.contradictions || [],
        agent1.credibility_scores || [
          { label: 'Health', score: response.overall_health_score ?? 75 },
          { label: 'Safety', score: response.brand_safety_score ?? 80 },
        ],
        agent1.temporal_trends || [],
        response.agent2_strategy || { action_chain: [] },
        response.agent3_creative || {}
      );
      navigation.navigate('Contradiction', { analysis: response });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Analysis failed';
      setError(msg || 'Analysis failed. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      icon: 'file-text' as const,
      title: 'Sales Transaction Logs',
      subtitle: 'Upload CSV or paste weekly figures',
      body: (
        <>
          <SecondaryButton label="Upload CSV" onPress={pickSalesCsv} />
          {salesCsvFile ? (
            <Text style={[styles.fileName, { color: T.textSecondary }]}>{salesCsvFile.name}</Text>
          ) : null}
          <TextInput
            style={[styles.multiline, { backgroundColor: T.btnSecondary, color: T.text, borderColor: T.border, borderRadius: T.radius.lg }]}
            placeholder="Week,Sales..."
            placeholderTextColor={T.textMuted}
            multiline
            value={manualSalesText}
            onChangeText={setManualSalesText}
            autoCorrect={false}
          />
        </>
      ),
    },
    {
      icon: 'message-circle' as const,
      title: 'Social Comments & Reviews',
      subtitle: 'Customer sentiment logs',
      body: (
        <TextInput
          style={[styles.multiline, { backgroundColor: T.btnSecondary, color: T.text, borderColor: T.border, borderRadius: T.radius.lg }]}
          placeholder="Paste reviews and comments..."
          placeholderTextColor={T.textMuted}
          multiline
          value={socialComments}
          onChangeText={setSocialComments}
          autoCorrect={false}
        />
      ),
    },
    {
      icon: 'package' as const,
      title: 'Warehouse Stock Balance',
      subtitle: 'Current inventory units',
      body: (
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={[styles.stepBtn, { backgroundColor: T.btnSecondary }]}
            onPress={() => setInventoryStock((v) => Math.max(0, v - 100))}
          >
            <Text style={[styles.stepBtnText, { color: T.text }]}>−</Text>
          </TouchableOpacity>
          {inventoryEditing ? (
            <TextInput
              style={[styles.stepValueInput, { color: T.text }]}
              value={String(inventoryStock)}
              onChangeText={(t) => setInventoryStock(parseInt(t, 10) || 0)}
              keyboardType="numeric"
              autoCorrect={false}
              onBlur={() => setInventoryEditing(false)}
            />
          ) : (
            <TouchableOpacity onPress={() => setInventoryEditing(true)}>
              <Text style={[styles.stepValue, { color: T.text }]}>{inventoryStock}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.stepBtn, { backgroundColor: T.btnSecondary }]}
            onPress={() => setInventoryStock((v) => v + 100)}
          >
            <Text style={[styles.stepBtnText, { color: T.text }]}>+</Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      icon: 'trending-up' as const,
      title: 'Monthly Marketing Spend',
      subtitle: 'Budget in PKR',
      body: (
        <View style={styles.pkrRow}>
          <Text style={[styles.pkrPrefix, { color: T.textSecondary }]}>PKR</Text>
          <TextInput
            style={[styles.pkrInput, { backgroundColor: T.btnSecondary, color: T.text, borderColor: T.border, borderRadius: T.radius.lg }]}
            value={marketingSpend}
            onChangeText={setMarketingSpend}
            keyboardType="numeric"
            autoCorrect={false}
          />
        </View>
      ),
    },
    {
      icon: 'users' as const,
      title: 'Target Audience Profile',
      subtitle: 'Ideal customer demographics & main competitors',
      body: (
        <TextInput
          style={[styles.multiline, { backgroundColor: T.btnSecondary, color: T.text, borderColor: T.border, borderRadius: T.radius.lg }]}
          placeholder="Describe your ideal customers (demographics, location) and primary competitors..."
          placeholderTextColor={T.textMuted}
          multiline
          value={manualLeadsText}
          onChangeText={setManualLeadsText}
          autoCorrect={false}
        />
      ),
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />
      
      {/* ── HEADER ── */}
      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="arrow-back" size={24} color={T.accent} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: T.text }]}>Data Sources</Text>
          <Text style={[styles.headerSub, { color: T.textSecondary }]}>5 inputs required to begin analysis</Text>
        </View>
        <BrandAvatar />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={T.accent} />
          <Text style={[styles.loaderText, { color: T.textSecondary }]}>Running analytics pipeline...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.progressRow}>
            {sectionComplete.map((done, i) => (
              <View key={i} style={styles.dotWrap}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: done ? T.btnPrimary : T.divider },
                  ]}
                />
                {i < 4 ? <View style={[styles.dotLine, { backgroundColor: T.divider }]} /> : null}
              </View>
            ))}
          </View>
          {error ? <Text style={{ color: T.error, marginBottom: 12 }}>{error}</Text> : null}
          {sections.map((s, i) => (
            <Card key={s.title} animated delay={i * 100} style={{ marginBottom: 16 }}>
              <View style={styles.sectionHead}>
                <Feather name={s.icon} size={20} color={T.accent} />
                <View style={styles.sectionTitles}>
                  <Text style={[styles.sectionTitle, { color: T.text }]}>{s.title}</Text>
                  <Text style={[styles.sectionSub, { color: T.textSecondary }]}>{s.subtitle}</Text>
                </View>
              </View>
              {s.body}
            </Card>
          ))}
          <PrimaryButton
            label="Start Analysis →"
            onPress={handleAnalyze}
            disabled={!allComplete}
            style={{ marginTop: 8, marginBottom: 32 }}
          />
        </ScrollView>
      )}
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
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 8 },
  dotWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotLine: { flex: 1, height: 2, marginHorizontal: 4 },
  sectionHead: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  sectionTitles: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  sectionSub: { fontSize: 12, marginTop: 2 },
  multiline: { borderWidth: 1, padding: 14, minHeight: 88, fontSize: 14, marginTop: 10, textAlignVertical: 'top' },
  fileName: { fontSize: 12, marginTop: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  stepBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 20, fontWeight: '600' },
  stepValue: { fontSize: 20, fontWeight: '700', width: 80, textAlign: 'center' },
  stepValueInput: { fontSize: 20, fontWeight: '700', width: 80, textAlign: 'center' },
  pkrRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pkrPrefix: { fontSize: 15, fontWeight: '600' },
  pkrInput: { flex: 1, borderWidth: 1, padding: 14, fontSize: 15 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { fontSize: 14 },
});
