import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { useCampaignStore } from '../store/campaignStore';
import { useTheme } from '../theme/useTheme';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { BrandAvatar } from '../components/BrandLogo';

const SEVERITY = {
  high: { color: '#EF4444', label: 'High' },
  medium: { color: '#F59E0B', label: 'Medium' },
  low: { color: '#22C55E', label: 'Low' },
};

function ScoreGauge({
  label,
  value,
  color,
  track,
  labelColor,
}: {
  label: string;
  value: number;
  color: string;
  track: string;
  labelColor: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const size = 88;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 800, useNativeDriver: false }).start();
  }, [value]);

  const [display, setDisplay] = React.useState(0);
  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => anim.removeListener(id);
  }, [anim]);

  const offset = circ - (display / 100) * circ;

  return (
    <View style={styles.gaugeWrap}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[styles.gaugePct, { color }]}>{display}%</Text>
      <Text style={[styles.gaugeLabel, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

export const ContradictionScreen = () => {
  const navigation = useNavigation<any>();
  const T = useTheme();
  const { contradictions, credibilityScores } = useCampaignStore();

  const brandSafety = useRef(new Animated.Value(0)).current;
  const [safetyWidth, setSafetyWidth] = React.useState('0%');

  const items = useMemo(() => {
    if (contradictions?.length) {
      return contradictions.map((c: any, i: number) => {
        const text = typeof c === 'string' ? c : c.description || c.title || String(c);
        const title = typeof c === 'object' && c.title ? c.title : text.slice(0, 60);
        const rawSev = typeof c === 'object' && c.severity ? String(c.severity).toLowerCase() : '';
        const sev =
          rawSev === 'high' || rawSev === 'medium' || rawSev === 'low'
            ? rawSev
            : i % 3 === 0
            ? 'high'
            : i % 3 === 1
            ? 'medium'
            : 'low';
        return { id: c.id || String(i), title, body: text, severity: sev };
      });
    }
    return [
      { id: '1', title: 'Inventory vs Sales mismatch', body: 'Warehouse logs show 12% variance against invoiced sales for Week 4.', severity: 'high' },
      { id: '2', title: 'Marketing ROI below benchmark', body: 'Paid social spend efficiency dropped 8% versus category median.', severity: 'medium' },
      { id: '3', title: 'Sentiment drift detected', body: 'Negative delivery reviews increased while sales remained flat.', severity: 'low' },
    ];
  }, [contradictions]);

  const dataScore = credibilityScores?.[0]?.score ?? 78;
  const trustScore = credibilityScores?.[1]?.score ?? 85;
  const safetyVal = 72;

  useEffect(() => {
    Animated.timing(brandSafety, { toValue: safetyVal, duration: 800, useNativeDriver: false }).start();
    const sub = brandSafety.addListener(({ value }) => setSafetyWidth(`${value}%`));
    return () => brandSafety.removeListener(sub);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof items)[0]; index: number }) => {
      const sev = SEVERITY[item.severity as keyof typeof SEVERITY] || SEVERITY.medium;
      return (
        <Card animated delay={index * 100} style={styles.contraCard}>
          <View style={[styles.sevDot, { backgroundColor: sev.color }]} />
          <View style={styles.contraBody}>
            <Text style={[styles.contraTitle, { color: T.text }]}>{item.title}</Text>
            <Text style={[styles.contraText, { color: T.textSecondary }]}>{item.body}</Text>
            <Badge label={sev.label} color={T.withAlpha(sev.color, 0.15)} />
          </View>
        </Card>
      );
    },
    [T]
  );

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />
      
      {/* ── HEADER ── */}
      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={T.accent} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: T.text }]}>Forensic Audit</Text>
          <Text style={[styles.headerSub, { color: T.textSecondary }]}>AI-detected contradictions in your data</Text>
        </View>
        <BrandAvatar />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.gaugesRow}>
          <ScoreGauge label="Data Integrity" value={dataScore} color={T.accent} track={T.divider} labelColor={T.textSecondary} />
          <ScoreGauge label="Source Trust" value={trustScore} color={T.accent} track={T.divider} labelColor={T.textSecondary} />
        </View>

        {items.map((item, index) => (
          <View key={item.id}>{renderItem({ item, index })}</View>
        ))}

        <Card style={styles.safetyCard}>
          <Text style={[styles.safetyTitle, { color: T.text }]}>Brand Safety</Text>
          <View style={[styles.safetyTrack, { backgroundColor: T.divider }]}>
            <View style={[styles.safetyFill, { backgroundColor: T.accent, width: safetyWidth as `${number}%` }]} />
          </View>
          <Text style={[styles.safetyPct, { color: T.textSecondary }]}>{safetyVal}% compliant</Text>
        </Card>

        <PrimaryButton label="View Strategy →" onPress={() => navigation.navigate('Strategy')} style={{ marginTop: 8 }} />
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
  gaugesRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  gaugeWrap: { alignItems: 'center' },
  gaugePct: { position: 'absolute', top: 32, fontSize: 24, fontWeight: '800' },
  gaugeLabel: { marginTop: 8, fontSize: 12 },
  contraCard: { flexDirection: 'row', marginBottom: 12, gap: 12 },
  sevDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  contraBody: { flex: 1 },
  contraTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  contraText: { fontSize: 13, lineHeight: 20, marginBottom: 10 },
  safetyCard: { marginTop: 8, marginBottom: 16 },
  safetyTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  safetyTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  safetyFill: { height: '100%', borderRadius: 999 },
  safetyPct: { fontSize: 12, marginTop: 8 },
});
