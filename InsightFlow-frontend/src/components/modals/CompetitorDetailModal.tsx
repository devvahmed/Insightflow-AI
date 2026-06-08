import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SpotlightModal } from './SpotlightModal';
import { useTheme } from '../../theme/useTheme';
import { DashboardCompetitor, formatPriceComparisonLabel } from '../../utils/dashboardData';
import { Badge } from '../ui/Badge';

const THREAT_COLORS = {
  HIGH: '#EF4444',
  MEDIUM: '#F59E0B',
  LOW: '#22C55E',
};

interface CompetitorDetailModalProps {
  visible: boolean;
  onClose: () => void;
  competitor: DashboardCompetitor | null;
}

export const CompetitorDetailModal = ({
  visible,
  onClose,
  competitor,
}: CompetitorDetailModalProps) => {
  const T = useTheme();
  if (!competitor) return null;

  const threatColor = THREAT_COLORS[competitor.threatLevel];

  return (
    <SpotlightModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: T.text }]}>{competitor.brand}</Text>
        <TouchableOpacity onPress={onClose} hitSlop={12}>
          <Feather name="x" size={22} color={T.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroRow}>
          {competitor.logoUrl ? (
            <Image source={{ uri: competitor.logoUrl }} style={styles.logo} resizeMode="contain" />
          ) : (
            <View style={[styles.logoFallback, { backgroundColor: T.btnSecondary }]}>
              <Text style={[styles.initials, { color: T.accent }]}>{competitor.initials}</Text>
            </View>
          )}
          <View style={styles.heroMeta}>
            <Badge label={competitor.threatLevel} color={T.withAlpha(threatColor, 0.15)} />
            <Text style={[styles.metaLine, { color: T.textSecondary }]}>
              {competitor.activeAds} active campaigns · Last seen {competitor.lastSeen}
            </Text>
            {competitor.marketShare != null ? (
              <Text style={[styles.metaLine, { color: T.text }]}>
                Market share: {competitor.marketShare}%
              </Text>
            ) : null}
          </View>
        </View>

        <Text style={[styles.section, { color: T.textTertiary }]}>LIVE ALERT</Text>
        <View style={[styles.block, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.body, { color: T.text }]}>{competitor.recentAd}</Text>
        </View>

        <Text style={[styles.section, { color: T.textTertiary }]}>PRICING</Text>
        <View style={[styles.block, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.body, { color: T.textSecondary }]}>
            {formatPriceComparisonLabel(competitor.priceComparison)}
          </Text>
        </View>

        {competitor.estimatedRevenuePkr ? (
          <>
            <Text style={[styles.section, { color: T.textTertiary }]}>EST. MONTHLY REVENUE</Text>
            <View style={[styles.block, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[styles.bigValue, { color: T.text }]}>
                PKR {(competitor.estimatedRevenuePkr / 1_000_000).toFixed(1)}M
              </Text>
            </View>
          </>
        ) : null}

        {competitor.strengths?.length ? (
          <>
            <Text style={[styles.section, { color: T.textTertiary }]}>STRENGTHS</Text>
            {competitor.strengths.map((s) => (
              <Text key={s} style={[styles.bullet, { color: T.textSecondary }]}>
                • {s}
              </Text>
            ))}
          </>
        ) : null}

        {competitor.weaknesses?.length ? (
          <>
            <Text style={[styles.section, { color: T.textTertiary }]}>WEAKNESSES</Text>
            {competitor.weaknesses.map((w) => (
              <Text key={w} style={[styles.bullet, { color: T.textSecondary }]}>
                • {w}
              </Text>
            ))}
          </>
        ) : null}

        {competitor.socialFollowers ? (
          <>
            <Text style={[styles.section, { color: T.textTertiary }]}>SOCIAL FOLLOWERS</Text>
            <View style={styles.socialRow}>
              {(
                [
                  ['instagram', 'logo-instagram'],
                  ['tiktok', 'logo-tiktok'],
                  ['facebook', 'logo-facebook'],
                ] as const
              ).map(([key, icon]) => {
                const n = competitor.socialFollowers?.[key];
                if (!n) return null;
                return (
                  <View key={key} style={[styles.socialChip, { borderColor: T.border }]}>
                    <Ionicons name={icon} size={16} color={T.textSecondary} />
                    <Text style={[styles.socialNum, { color: T.text }]}>
                      {(n / 1000).toFixed(0)}k
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : null}

        {competitor.website ? (
          <Text style={[styles.website, { color: T.accent }]} numberOfLines={1}>
            {competitor.website}
          </Text>
        ) : null}
      </ScrollView>
    </SpotlightModal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '800', flex: 1, marginRight: 8 },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 14 },
  logo: { width: 64, height: 64, borderRadius: 14 },
  logoFallback: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 22, fontWeight: '800' },
  heroMeta: { flex: 1, gap: 6 },
  metaLine: { fontSize: 13 },
  section: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  block: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  body: { fontSize: 14, lineHeight: 21 },
  bigValue: { fontSize: 24, fontWeight: '800' },
  bullet: { fontSize: 13, lineHeight: 20, marginBottom: 4, paddingLeft: 4 },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  socialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  socialNum: { fontSize: 13, fontWeight: '700' },
  website: { fontSize: 12, marginBottom: 24 },
});
