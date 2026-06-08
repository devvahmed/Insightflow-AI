import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { SpotlightModal } from './SpotlightModal';
import { useTheme } from '../../theme/useTheme';
import { Badge } from '../ui/Badge';
import { fadeIn, slideUp } from '../../utils/animations';

import { DashboardCampaign } from '../../utils/dashboardData';

const MONTHS = ['Feb', 'Mar', 'Apr', 'May'];

interface RevenueModalProps {
  visible: boolean;
  onClose: () => void;
  campaigns: DashboardCampaign[];
  totalRevenue: number;
  growthPct: number;
  totalReach: number;
}

function DonutChart({
  segments,
  size,
  centerLabel,
  centerValue,
}: {
  segments: { pct: number; color: string }[];
  size: number;
  centerLabel: string;
  centerValue: string;
}) {
  const T = useTheme();
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke={T.divider} strokeWidth={14} fill="none" />
        {segments.map((seg, i) => {
          const dash = (seg.pct / 100) * circ;
          const el = (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              stroke={seg.color}
              strokeWidth={14}
              fill="none"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              rotation="-90"
              origin={`${cx}, ${cy}`}
            />
          );
          offset += dash;
          return el;
        })}
      </Svg>
      <View style={styles.donutCenter}>
        <Text style={[styles.donutLabel, { color: T.textSecondary }]}>{centerLabel}</Text>
        <Text style={[styles.donutValue, { color: T.text }]}>{centerValue}</Text>
      </View>
    </View>
  );
}

function ContributionRow({ item, index }: { item: DashboardCampaign; index: number }) {
  const T = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const [widthPct, setWidthPct] = useState('0%');

  useEffect(() => {
    Animated.parallel([fadeIn(opacity, index * 80), slideUp(translateY, index * 80)]).start();
    barWidth.setValue(0);
    const id = barWidth.addListener(({ value }) => setWidthPct(`${value}%`));
    Animated.timing(barWidth, {
      toValue: item.revenueContribution,
      duration: 700,
      delay: index * 80,
      useNativeDriver: false,
    }).start();
    return () => barWidth.removeListener(id);
  }, [index, item.revenueContribution]);

  return (
    <Animated.View
      style={[
        styles.rowCard,
        { backgroundColor: T.card, borderColor: T.border, opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.numBadge, { backgroundColor: T.withAlpha(T.accent, 0.12) }]}>
        <Text style={[styles.numText, { color: T.accent }]}>{item.id}</Text>
      </View>
      <View style={styles.rowCenter}>
        <Text style={[styles.rowName, { color: T.text }]}>{item.name}</Text>
        <View style={[styles.barTrack, { backgroundColor: T.divider }]}>
          <View style={[styles.barFill, { backgroundColor: T.accent, width: widthPct as `${number}%` }]} />
        </View>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.pct, { color: '#22C55E' }]}>+{item.revenueContribution}%</Text>
        <Text style={[styles.pkr, { color: T.textSecondary }]}>
          PKR {(item.revenueAmount / 1000).toFixed(0)}k
        </Text>
      </View>
    </Animated.View>
  );
}

export const RevenueModal = ({
  visible,
  onClose,
  campaigns,
  totalRevenue,
  growthPct,
  totalReach,
}: RevenueModalProps) => {
  const T = useTheme();
  const countAnim = useRef(new Animated.Value(0)).current;
  const [displayRev, setDisplayRev] = useState(0);
  const monthValues = campaigns.length
    ? MONTHS.map((_, i) => {
        const c = campaigns[i % campaigns.length];
        return (c.revenueAmount || 0) / 1_000_000;
      })
    : MONTHS.map(() => 0);
  const barAnims = useRef(monthValues.map(() => new Animated.Value(0))).current;
  const [barHeights, setBarHeights] = useState(monthValues.map(() => 0));
  const chartW = Dimensions.get('window').width - 72;
  const maxMonth = Math.max(...monthValues, 0.1);

  const platformTotals = campaigns.reduce(
    (acc, c) => {
      acc.instagram += c.platforms.instagram;
      acc.tiktok += c.platforms.tiktok;
      acc.facebook += c.platforms.facebook;
      return acc;
    },
    { instagram: 0, tiktok: 0, facebook: 0 }
  );
  const platSum =
    platformTotals.instagram + platformTotals.tiktok + platformTotals.facebook || 1;
  const ig = campaigns.length
    ? Math.round((platformTotals.instagram / platSum) * 100)
    : 0;
  const tt = campaigns.length ? Math.round((platformTotals.tiktok / platSum) * 100) : 0;
  const fb = campaigns.length
    ? Math.round((platformTotals.facebook / platSum) * 100)
    : 0;

  useEffect(() => {
    if (!visible) return;
    countAnim.setValue(0);
    const id = countAnim.addListener(({ value }) => setDisplayRev(Math.round(value)));
    Animated.timing(countAnim, {
      toValue: totalRevenue,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    barAnims.forEach((anim, i) => {
      anim.addListener(({ value }) => {
        setBarHeights((prev) => {
          const next = [...prev];
          next[i] = value;
          return next;
        });
      });
      Animated.timing(anim, {
        toValue: (monthValues[i] / maxMonth) * 100,
        duration: 800,
        delay: 400 + i * 120,
        useNativeDriver: false,
      }).start();
    });

    return () => countAnim.removeListener(id);
  }, [visible, totalRevenue]);

  const reachLabel =
    totalReach >= 1000 ? `${(totalReach / 1000).toFixed(0)}k` : String(totalReach);

  return (
    <SpotlightModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: T.text }]}>Revenue Breakdown</Text>
          <Text style={[styles.subtitle, { color: T.textSecondary }]}>Per-campaign contribution</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={22} color={T.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={[styles.heroValue, { color: T.text }]}>
          {totalRevenue > 0
            ? `PKR ${(displayRev / 1000000).toFixed(1)}M`
            : 'PKR 0'}
        </Text>
        <Badge
          label={
            growthPct > 0
              ? `+${growthPct}% avg campaign ROI`
              : 'Run a campaign to track profit'
          }
          color={T.withAlpha(growthPct > 0 ? '#22C55E' : T.textMuted, 0.15)}
        />
      </View>

      {campaigns.length === 0 ? (
        <Text style={[styles.emptyHint, { color: T.textSecondary }]}>
          No revenue yet. Complete an analysis and launch a campaign to see profit breakdown here.
        </Text>
      ) : (
        campaigns.map((c, i) => <ContributionRow key={c.id} item={c} index={i} />)
      )}

      {campaigns.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Platform Reach</Text>
          <DonutChart
            size={160}
            centerLabel="Total Reach"
            centerValue={reachLabel}
            segments={[
              { pct: ig || 34, color: T.accent },
              { pct: tt || 33, color: '#FF0050' },
              { pct: fb || 33, color: '#1877F2' },
            ]}
          />
        </>
      ) : null}
      <View style={styles.legend}>
        {[
          { label: 'Instagram', pct: `${ig}%`, color: T.accent },
          { label: 'TikTok', pct: `${tt}%`, color: '#FF0050' },
          { label: 'Facebook', pct: `${fb}%`, color: '#1877F2' },
        ].map((l) => (
          <View key={l.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={[styles.legendLabel, { color: T.text }]}>{l.label}</Text>
            <Text style={[styles.legendPct, { color: T.textSecondary }]}>{l.pct}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: T.text }]}>Monthly Comparison</Text>
      <View style={[styles.barChart, { height: 120 }]}>
        {MONTHS.map((m, i) => {
          const isCurrent = i === MONTHS.length - 1;
          const h = barHeights[i] || 0;
          return (
            <View key={m} style={styles.barCol}>
              <View style={[styles.barTrackV, { backgroundColor: T.divider }]}>
                <View
                  style={{
                    height: `${h}%`,
                    backgroundColor: isCurrent ? T.accent : T.btnSecondary,
                    borderRadius: 6,
                    width: '100%',
                  }}
                />
              </View>
              <Text style={[styles.monthLabel, { color: T.textMuted }]}>{m}</Text>
            </View>
          );
        })}
      </View>
    </SpotlightModal>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  hero: { alignItems: 'center', marginBottom: 20 },
  heroValue: { fontSize: 36, fontWeight: '900', marginBottom: 8 },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  numBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  numText: { fontSize: 12, fontWeight: '800' },
  rowCenter: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  barTrack: { height: 6, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  rowRight: { alignItems: 'flex-end', marginLeft: 8 },
  pct: { fontSize: 16, fontWeight: '800' },
  pkr: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 12 },
  donutCenter: { position: 'absolute', top: 58, alignItems: 'center' },
  donutLabel: { fontSize: 11 },
  donutValue: { fontSize: 18, fontWeight: '800' },
  legend: { marginTop: 12, marginBottom: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendLabel: { flex: 1, fontSize: 13 },
  legendPct: { fontSize: 13 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 },
  barCol: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
  barTrackV: { width: '70%', height: 100, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  monthLabel: { fontSize: 10, marginTop: 6 },
  emptyHint: { fontSize: 14, lineHeight: 20, marginBottom: 16, textAlign: 'center' },
});
