import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/useTheme';
import { DashboardCompetitor, formatPriceComparisonLabel } from '../../utils/dashboardData';
import { slideUp, fadeIn } from '../../utils/animations';

const THREAT = {
  HIGH: { bg: '#EF4444', label: 'HIGH' },
  MEDIUM: { bg: '#F59E0B', label: 'MED' },
  LOW: { bg: '#22C55E', label: 'LOW' },
};

const PLATFORM_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  instagram: 'logo-instagram',
  tiktok: 'logo-tiktok',
  facebook: 'logo-facebook',
};

interface CompetitorCardProps {
  competitor: DashboardCompetitor;
  index: number;
  visible?: boolean;
  onPressDetails?: () => void;
}

function buildSparklinePath(values: number[], w: number, h: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return { x, y };
  });
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const mx = (coords[i - 1].x + coords[i].x) / 2;
    d += ` Q ${mx} ${coords[i - 1].y} ${coords[i].x} ${coords[i].y}`;
  }
  return d;
}

export const CompetitorCard = ({
  competitor,
  index,
  visible = true,
  onPressDetails,
}: CompetitorCardProps) => {
  const T = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(visible ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(visible ? 28 : 0)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;

  const [logoSrc, setLogoSrc] = useState(competitor.logoUrl || '');
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoSrc(competitor.logoUrl || '');
    setLogoFailed(false);
  }, [competitor.logoUrl, competitor.logoFallback]);

  const threat = THREAT[competitor.threatLevel];
  const hasNumericPrice =
    competitor.theirPrice != null && competitor.yourPrice != null;
  const diff = hasNumericPrice ? competitor.yourPrice! - competitor.theirPrice! : 0;
  const cheaper = diff > 0;
  const sparkW = 200;
  const sparkPath = buildSparklinePath(competitor.sparkline, sparkW, 40);
  const lineColor = competitor.trend === 'up' ? '#EF4444' : T.textMuted;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(0);
    translateY.setValue(28);
    Animated.parallel([
      fadeIn(opacity, 800 + index * 70, 420),
      slideUp(translateY, 800 + index * 70, 420),
    ]).start();
  }, [visible, index]);

  useEffect(() => {
    if (competitor.threatLevel !== 'HIGH') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(badgePulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [competitor.threatLevel]);

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 15 }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPressDetails}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        style={[
          styles.card,
          T.shadow,
          {
            backgroundColor: T.card,
            borderColor: T.border,
            borderRadius: T.radius.xl,
            opacity,
            transform: [{ translateY }, { scale }],
          },
        ]}
      >
        <View style={styles.topRow}>
          <View style={styles.logoCol}>
            {logoSrc && !logoFailed ? (
              <Image
                source={{ uri: logoSrc }}
                style={[styles.logoCircle, { backgroundColor: T.btnSecondary }]}
                resizeMode="contain"
                onError={() => {
                  if (competitor.logoFallback && logoSrc !== competitor.logoFallback) {
                    setLogoSrc(competitor.logoFallback);
                  } else {
                    setLogoFailed(true);
                  }
                }}
              />
            ) : (
              <View style={[styles.logoCircle, { backgroundColor: T.btnSecondary }]}>
                <Text style={[styles.initials, { color: T.accent }]}>{competitor.initials}</Text>
              </View>
            )}
            <View style={styles.platformRow}>
              {competitor.platforms.map((p) => (
                <Ionicons
                  key={p}
                  name={PLATFORM_ICON[p]}
                  size={14}
                  color={T.textSecondary}
                  style={{ marginRight: 4 }}
                />
              ))}
            </View>
          </View>
          <View style={styles.centerCol}>
            <Text style={[styles.brand, { color: T.text }]}>{competitor.brand}</Text>
            <Text style={[styles.meta, { color: T.textSecondary }]}>
              {competitor.activeAds} active {competitor.activeAds === 1 ? 'campaign' : 'campaigns'}
            </Text>
            <Text style={[styles.muted, { color: T.textMuted }]}>Last seen {competitor.lastSeen}</Text>
          </View>
          <Animated.View
            style={[
              styles.threatBadge,
              { backgroundColor: threat.bg, transform: [{ scale: badgePulse }] },
            ]}
          >
            <Text style={styles.threatText}>{threat.label}</Text>
          </Animated.View>
        </View>

        <View style={styles.sparkRow}>
          <Svg width={sparkW} height={40} style={{ flex: 1 }}>
            <Path d={sparkPath} fill="none" stroke={lineColor} strokeWidth={2} />
          </Svg>
          <Feather
            name={competitor.trend === 'up' ? 'trending-up' : 'trending-down'}
            size={18}
            color={lineColor}
          />
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: T.textSecondary }]}>
            {hasNumericPrice ? 'vs Your Price' : 'Market position'}
          </Text>
          {hasNumericPrice ? (
            <View style={styles.priceVals}>
              <Text
                style={[styles.theirPrice, { color: cheaper ? '#EF4444' : '#22C55E' }]}
              >
                PKR {competitor.theirPrice!.toLocaleString()}
              </Text>
              <Text style={[styles.yourPrice, { color: T.textMuted }]}>
                You: PKR {competitor.yourPrice!.toLocaleString()}
              </Text>
              <View
                style={[
                  styles.diffPill,
                  { backgroundColor: T.withAlpha(cheaper ? '#EF4444' : '#22C55E', 0.12) },
                ]}
              >
                <Text
                  style={{
                    color: cheaper ? '#EF4444' : '#22C55E',
                    fontSize: 11,
                    fontWeight: '600',
                  }}
                >
                  {diff > 0 ? `-${diff}` : `+${Math.abs(diff)}`} PKR
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.priceCompareText, { color: T.text }]}>
              {formatPriceComparisonLabel(competitor.priceComparison)}
            </Text>
          )}
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.adPreview, { color: T.textSecondary }]} numberOfLines={1}>
            Recent: <Text style={{ fontStyle: 'italic' }}>{competitor.recentAd}</Text>
          </Text>
          <View style={styles.detailsLink}>
            <Text style={[styles.detailsText, { color: T.accent }]}>View Details</Text>
            <Feather name="chevron-right" size={14} color={T.accent} />
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1, marginBottom: 0 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  logoCol: { alignItems: 'center', marginRight: 12 },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: { fontSize: 18, fontWeight: '800' },
  platformRow: { flexDirection: 'row', marginTop: 6 },
  centerCol: { flex: 1 },
  brand: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 2 },
  muted: { fontSize: 11, marginTop: 2 },
  threatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  threatText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  sparkRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 8 },
  priceRow: { marginBottom: 10 },
  priceLabel: { fontSize: 11, marginBottom: 4 },
  priceVals: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  priceCompareText: { fontSize: 13, fontWeight: '600' },
  theirPrice: { fontSize: 14, fontWeight: '700' },
  yourPrice: { fontSize: 14 },
  diffPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  adPreview: { fontSize: 12, flex: 1 },
  detailsLink: { flexDirection: 'row', alignItems: 'center' },
  detailsText: { fontSize: 12, fontWeight: '600', marginRight: 2 },
});
