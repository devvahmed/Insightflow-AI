import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  FlatList,
  Animated,
  Dimensions,
  ViewToken,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useUserStore, useAuthStore } from '../store/userStore';
import { useTheme } from '../theme/useTheme';
import { getCompetitorsApi, getMeApi } from '../api/api';
import { APP_DEFAULTS } from '../constants/mockData';
import { Card } from '../components/ui/Card';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SalesAreaChart } from '../components/charts/SalesAreaChart';
import { CompetitorCard } from '../components/cards/CompetitorCard';
import { CampaignsModal } from '../components/modals/CampaignsModal';
import { CompetitorAlertsModal } from '../components/modals/CompetitorAlertsModal';
import { RevenueModal } from '../components/modals/RevenueModal';
import { CompetitorDetailModal } from '../components/modals/CompetitorDetailModal';
import { fadeIn, slideUp, slideDown, scaleIn } from '../utils/animations';
// BrandAvatar defined inline below
import {
  DashboardAlert,
  DashboardCampaign,
  DashboardCompetitor,
  buildAlertsFromCompetitors,
  buildWeeklyChart,
  computeSalesGrowth,
  computeTotalRevenue,
  mapApiCampaigns,
  mapApiCompetitors,
  mergeCampaignLists,
} from '../utils/dashboardData';
import { resolveMediaUrl } from '../utils/mediaUrl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_W = SCREEN_WIDTH - 40;

const EMPTY_INSIGHT =
  'Run your first analysis to get custom marketing insights tailored to your brand and competitors.';

type MetricId = 'campaigns' | 'alerts' | 'growth';

interface MetricConfig {
  id: MetricId;
  icon: string;
  label: string;
  displayValue: string;
  numericEnd?: number;
  suffix?: string;
  prefix?: string;
  pulse?: boolean;
  onPress: () => void;
}

function MetricCard({ config, delay }: { config: MetricConfig; delay: number }) {
  const T = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const pulseDot = useRef(new Animated.Value(1)).current;
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(40);
    Animated.parallel([
      fadeIn(opacity, delay, 450),
      slideUp(translateY, delay, 450),
    ]).start();
    Animated.sequence([
      Animated.spring(cardScale, { toValue: 1.03, useNativeDriver: true, damping: 12 }),
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, damping: 14 }),
    ]).start();

    if (config.numericEnd !== undefined) {
      countAnim.setValue(0);
      const id = countAnim.addListener(({ value }) => {
        const n = Math.round(value);
        setDisplay(`${config.prefix ?? ''}${n}${config.suffix ?? ''}`);
      });
      Animated.timing(countAnim, {
        toValue: config.numericEnd,
        duration: 800,
        delay: delay + 100,
        useNativeDriver: false,
      }).start();
      return () => countAnim.removeListener(id);
    }
    setDisplay(config.displayValue);
  }, [config, delay]);

  useEffect(() => {
    if (!config.pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseDot, { toValue: 1.4, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseDot, { toValue: 1, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [config.pulse]);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={config.onPress}>
      <Animated.View
        style={[
          styles.metricCard,
          T.shadow,
          {
            backgroundColor: T.card,
            borderColor: T.border,
            opacity,
            transform: [{ translateY }, { scale: cardScale }],
          },
        ]}
      >
        <Feather name={config.icon as any} size={20} color={T.accent} />
        <Text style={[styles.metricValue, { color: T.text }]}>
          {config.numericEnd !== undefined ? display : config.displayValue}
        </Text>
        <Text style={[styles.metricLabel, { color: T.textSecondary }]}>{config.label}</Text>
        {config.pulse ? (
          <Animated.View
            style={[styles.pulseDot, { backgroundColor: T.accent, transform: [{ scale: pulseDot }] }]}
          />
        ) : null}
      </Animated.View>
    </TouchableOpacity>
  );
}

const BrandAvatar = () => {
  const T = useTheme();
  const user = useAuthStore(state => state.user);
  const [imgError, setImgError] = React.useState(false);
  
  const logoUri = resolveMediaUrl(user?.logo_url) || '';
  const initials = (user?.brand_name || 'B')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (logoUri && !imgError) {
    return (
      <Image
        source={{ uri: logoUri }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
        }}
        resizeMode="contain"
        onError={() => setImgError(true)}
      />
    );
  }

  // Initials fallback — only shown if logo truly fails
  return (
    <View style={{
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: T.accent + '33',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{
        color: T.accent,
        fontWeight: '800',
        fontSize: 16,
      }}>
        {initials}
      </Text>
    </View>
  );
};

export const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const T = useTheme();
  const userProfile = useUserStore((s) => s.userProfile);
  const user = useUserStore((s) => s.user);
  const token = useUserStore((s) => s.token);
  const setAuth = useUserStore((s) => s.setAuth);
  const toggleDark = useUserStore((s) => s.toggleDarkMode);

  const brandName = userProfile?.business_name ?? user?.brand_name ?? APP_DEFAULTS.brandName;

  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);
  const [detailCompetitor, setDetailCompetitor] = useState<DashboardCompetitor | null>(null);
  const [visibleCompetitors, setVisibleCompetitors] = useState<Set<string>>(new Set());
  const [competitors, setCompetitors] = useState<DashboardCompetitor[]>([]);
  const [campaigns, setCampaigns] = useState<DashboardCampaign[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [marketInsight, setMarketInsight] = useState(EMPTY_INSIGHT);
  const [loading, setLoading] = useState(true);

  const headerY = useRef(new Animated.Value(-20)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const greetOpacity = useRef(new Animated.Value(0)).current;
  const brandScale = useRef(new Animated.Value(0.95)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const insightOpacity = useRef(new Animated.Value(0)).current;
  const insightY = useRef(new Animated.Value(30)).current;
  const accentBarH = useRef(new Animated.Value(0)).current;
  const [accentBarHpx, setAccentBarHpx] = useState(0);
  const fabScale = useRef(new Animated.Value(0)).current;
  const fabFloat = useRef(new Animated.Value(0)).current;

  const totalCampaigns = campaigns.length;
  const growthPct = computeSalesGrowth(campaigns);
  const totalRevenue = computeTotalRevenue(campaigns);
  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);
  const weeklyChart = useMemo(() => buildWeeklyChart(campaigns), [campaigns]);

  const refreshDashboard = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const me = await getMeApi(token);
      const fromApi = mapApiCampaigns((me.campaigns as unknown[]) || []);
      const fromStore = mapApiCampaigns(
        (useUserStore.getState().user?.campaigns as unknown[]) || []
      );
      setCampaigns(mergeCampaignLists(fromApi, fromStore));
      if (token) {
        setAuth(token, me as Record<string, unknown>);
      }

      const data = await getCompetitorsApi(token);
      const list = (data.competitors || data.competitor_list || []) as Record<string, unknown>[];
      if (list.length) {
        const mapped = mapApiCompetitors(list);
        setCompetitors(mapped);
        setAlerts(buildAlertsFromCompetitors(mapped));
      } else {
        setCompetitors([]);
        setAlerts([]);
      }

      if (data.your_position || data.market_summary || data.ai_counter_insight) {
        setMarketInsight(
          String(data.your_position || data.ai_counter_insight || data.market_summary)
        );
      } else if (!fromApi.length && !fromStore.length) {
        setMarketInsight(EMPTY_INSIGHT);
      }
    } catch {
      setCompetitors([]);
      setAlerts([]);
      setMarketInsight(EMPTY_INSIGHT);
    } finally {
      setLoading(false);
    }
  }, [token]);



  useFocusEffect(
    useCallback(() => {
      refreshDashboard();
    }, [refreshDashboard])
  );

  useEffect(() => {
    headerY.setValue(-20);
    headerOpacity.setValue(0);
    Animated.parallel([
      slideDown(headerY, 0, 500),
      fadeIn(headerOpacity, 0, 500),
    ]).start();
    fadeIn(greetOpacity, 100).start();
    brandScale.setValue(0.95);
    brandOpacity.setValue(0);
    Animated.parallel([
      fadeIn(brandOpacity, 200),
      Animated.spring(brandScale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 120 }),
    ]).start();
    Animated.parallel([fadeIn(insightOpacity, 750), slideUp(insightY, 750)]).start();
    accentBarH.setValue(0);
    const id = accentBarH.addListener(({ value }) => setAccentBarHpx((value / 100) * 72));
    Animated.timing(accentBarH, { toValue: 100, duration: 400, delay: 900, useNativeDriver: false }).start();
    scaleIn(fabScale, 1000).start();
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(fabFloat, { toValue: -4, duration: 1000, useNativeDriver: true }),
        Animated.timing(fabFloat, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    floatLoop.start();
    return () => accentBarH.removeListener(id);
  }, []);

  const metrics: MetricConfig[] = useMemo(
    () => [
      {
        id: 'campaigns',
        icon: 'bar-chart-2',
        label: 'Campaigns',
        displayValue: String(totalCampaigns),
        numericEnd: totalCampaigns,
        onPress: () => setShowCampaigns(true),
      },
      {
        id: 'alerts',
        icon: 'bell',
        label: 'Competitor Alerts',
        displayValue: String(alerts.length),
        numericEnd: alerts.length,
        pulse: alerts.length > 0,
        onPress: () => setShowAlerts(true),
      },
      {
        id: 'growth',
        icon: 'trending-up',
        label: 'Sales Growth',
        displayValue: growthPct > 0 ? `+${growthPct}%` : '0%',
        numericEnd: growthPct,
        prefix: growthPct > 0 ? '+' : '',
        suffix: '%',
        onPress: () => setShowRevenue(true),
      },
    ],
    [totalCampaigns, alerts.length, growthPct]
  );

  const onViewableCompetitors = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      setVisibleCompetitors(
        new Set(viewableItems.map((v) => (v.item as DashboardCompetitor).id))
      );
    },
    []
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 25 }).current;

  const renderCompetitor = useCallback(
    ({ item, index }: { item: DashboardCompetitor; index: number }) => (
      <View style={styles.competitorItemPad}>
        <CompetitorCard
          competitor={item}
          index={index}
          visible={visibleCompetitors.has(item.id) || index < 2}
          onPressDetails={() => setDetailCompetitor(item)}
        />
      </View>
    ),
    [visibleCompetitors]
  );

  const ListHeader = (
    <>
      <View style={[styles.header, { backgroundColor: T.surface, borderBottomColor: T.divider }]}>
        <Animated.View
          style={[
            styles.headerLogos,
            { opacity: headerOpacity, transform: [{ translateY: headerY }] },
          ]}
        >
          <View style={[styles.logoSlot, { backgroundColor: T.card, borderColor: T.border }]}>
            <Image source={APP_DEFAULTS.appLogo} style={styles.headerLogo} resizeMode="contain" />
          </View>
          <View style={[styles.logoDivider, { backgroundColor: T.divider }]} />
          <View style={[styles.logoSlot, { backgroundColor: T.card, borderColor: T.border }]}>
            <BrandAvatar />
          </View>
        </Animated.View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleDark} style={[styles.iconBtn, { borderColor: T.border }]}>
            <Feather name={T.isDarkMode ? 'sun' : 'moon'} size={18} color={T.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { borderColor: T.border }]}
            onPress={() => alerts.length > 0 && setShowAlerts(true)}
          >
            <Feather name="bell" size={18} color={T.text} />
            {alerts.length > 0 ? (
              <View style={[styles.notifBadge, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.notifBadgeText}>
                  {alerts.length > 9 ? '9+' : alerts.length}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bodyPad}>
        <Animated.Text style={[styles.greetSub, { color: T.textSecondary, opacity: greetOpacity }]}>
          {new Date().getHours() < 12
            ? 'Good morning,'
            : new Date().getHours() < 17
            ? 'Good afternoon,'
            : 'Good evening,'}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.greetName,
            { color: T.text, opacity: brandOpacity, transform: [{ scale: brandScale }] },
          ]}
        >
          {brandName}
        </Animated.Text>

        <View style={styles.metricsRow}>
          {metrics.map((m, i) => (
            <MetricCard key={m.id} config={m} delay={300 + i * 120} />
          ))}
        </View>

        <Card style={styles.chartCard}>
          {totalCampaigns === 0 ? (
            <View style={styles.chartEmpty}>
              <Text style={[styles.chartEmptyTitle, { color: T.text }]}>This Month&apos;s Revenue</Text>
              <Text style={[styles.chartEmptyBody, { color: T.textSecondary }]}>
                Launch a campaign to track weekly revenue vs target for this month.
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.chartMonthTitle, { color: T.textSecondary }]}>
                This month — weekly revenue
              </Text>
              <SalesAreaChart
                data={weeklyChart.data}
                target={weeklyChart.target}
                labels={weeklyChart.labels}
                width={CHART_W}
                height={172}
              />
            </>
          )}
        </Card>

        <Animated.View
          style={[
            styles.insightWrap,
            T.shadow,
            {
              backgroundColor: T.card,
              borderColor: T.border,
              opacity: insightOpacity,
              transform: [{ translateY: insightY }],
            },
          ]}
        >
          <View style={[styles.accentBarTrack, { backgroundColor: T.divider }]}>
            <View style={[styles.accentBarFill, { backgroundColor: T.accent, height: accentBarHpx }]} />
          </View>
          <View style={styles.insightContent}>
            <View style={styles.insightHead}>
              <Feather name="cpu" size={16} color={T.accent} />
              <Text style={[styles.insightTitle, { color: T.text }]}>AI Insight</Text>
            </View>
            <Text style={[styles.insightBody, { color: T.textSecondary }]}>{marketInsight}</Text>
          </View>
        </Animated.View>

        <View style={styles.feedHead}>
          <Text style={[styles.feedTitle, { color: T.text }]}>Competitor Intelligence</Text>
          {loading ? <ActivityIndicator size="small" color={T.accent} /> : null}
        </View>
      </View>
    </>
  );

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />

      <FlatList
        data={competitors}
        keyExtractor={(item) => item.id}
        renderItem={renderCompetitor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyCompetitors}>
              <Text style={[styles.chartEmptyBody, { color: T.textSecondary }]}>
                Competitor data will appear after signup with your website URL.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableCompetitors}
        viewabilityConfig={viewabilityConfig}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      <Animated.View
        style={[styles.fabWrap, { transform: [{ scale: fabScale }, { translateY: fabFloat }] }]}
      >
        <PrimaryButton
          label="Start New Analysis"
          onPress={() => navigation.navigate('Upload')}
          style={[T.shadowStrong, { shadowColor: T.btnPrimary, shadowOpacity: 0.25 }]}
        />
      </Animated.View>

      <CampaignsModal
        visible={showCampaigns}
        onClose={() => setShowCampaigns(false)}
        campaigns={campaigns}
        onStartCampaign={() => navigation.navigate('Upload')}
      />
      <CompetitorAlertsModal
        visible={showAlerts}
        onClose={() => setShowAlerts(false)}
        alerts={alerts}
      />
      <RevenueModal
        visible={showRevenue}
        onClose={() => setShowRevenue(false)}
        campaigns={campaigns}
        totalRevenue={totalRevenue}
        growthPct={growthPct}
        totalReach={totalReach}
      />
      <CompetitorDetailModal
        visible={!!detailCompetitor}
        onClose={() => setDetailCompetitor(null)}
        competitor={detailCompetitor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  logoSlot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerLogo: { width: 34, height: 34 },
  brandLogoFallback: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoLetter: { fontSize: 18, fontWeight: '800' },
  logoDivider: { width: 1, height: 32, marginHorizontal: 10 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  bodyPad: { paddingHorizontal: 20 },
  greetSub: { fontSize: 14, marginTop: 16 },
  greetName: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metricCard: {
    flex: 1,
    minHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  metricValue: { fontSize: 26, fontWeight: '800', marginTop: 10 },
  metricLabel: { fontSize: 11, marginTop: 4 },
  pulseDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartCard: { marginBottom: 16, paddingVertical: 8 },
  chartMonthTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8, paddingHorizontal: 4 },
  chartEmpty: { paddingVertical: 24, paddingHorizontal: 8, alignItems: 'center' },
  chartEmptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  chartEmptyBody: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  insightWrap: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  accentBarTrack: { width: 3, minHeight: 72, alignSelf: 'stretch' },
  accentBarFill: { width: '100%' },
  insightContent: { flex: 1, padding: 14 },
  insightHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  insightTitle: { fontSize: 13, fontWeight: '700' },
  insightBody: { fontSize: 13, lineHeight: 20 },
  feedHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  feedTitle: { fontSize: 18, fontWeight: '700' },
  competitorItemPad: { paddingHorizontal: 20 },
  emptyCompetitors: { paddingHorizontal: 20, paddingBottom: 24 },
  fabWrap: { position: 'absolute', bottom: 24, left: 20, right: 20 },
});
