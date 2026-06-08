import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SpotlightModal } from './SpotlightModal';
import { useTheme } from '../../theme/useTheme';
import { Badge } from '../ui/Badge';
import { fadeIn, slideUp } from '../../utils/animations';

import { DashboardAlert } from '../../utils/dashboardData';

type AlertItem = DashboardAlert;

const FILTERS = ['All', 'Price Drop', 'New Ad', 'Stock Alert', 'Flash Sale'] as const;

const BORDER_COLOR: Record<string, string> = {
  'Price Drop': '#EF4444',
  'New Ad': null as unknown as string,
  'Stock Alert': '#F59E0B',
  'Flash Sale': '#8B5CF6',
};

interface CompetitorAlertsModalProps {
  visible: boolean;
  onClose: () => void;
  alerts: AlertItem[];
}

function AlertRow({ item, index, accent }: { item: AlertItem; index: number; accent: string }) {
  const T = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const borderPulse = useRef(new Animated.Value(1)).current;

  const borderColor = item.type === 'New Ad' ? accent : BORDER_COLOR[item.type];

  useEffect(() => {
    Animated.parallel([fadeIn(opacity, index * 50), slideUp(translateY, index * 50)]).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(borderPulse, { toValue: 0.4, duration: 900, useNativeDriver: false }),
        Animated.timing(borderPulse, { toValue: 1, duration: 900, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.alertCard,
        {
          backgroundColor: T.card,
          borderColor: T.border,
          borderLeftColor: borderColor,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderLeftWidth: 3,
            borderLeftColor: borderColor,
            opacity: borderPulse,
          },
        ]}
        pointerEvents="none"
      />
      <View style={styles.alertTop}>
        {item.logoUrl ? (
          <Image source={{ uri: item.logoUrl }} style={styles.logoImg} resizeMode="contain" />
        ) : (
          <View style={[styles.logo, { backgroundColor: T.btnSecondary }]}>
            <Text style={[styles.logoText, { color: T.accent }]}>
              {item.brand.slice(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.alertMeta}>
          <Text style={[styles.brandName, { color: T.text }]}>{item.brand}</Text>
          <Badge label={item.type} color={T.withAlpha(borderColor, 0.15)} />
        </View>
        <Text style={[styles.time, { color: T.textMuted }]}>{item.timeAgo}</Text>
      </View>
      <Text style={[styles.desc, { color: T.textSecondary }]}>{item.description}</Text>
      {'oldPrice' in item && item.oldPrice ? (
        <Text style={[styles.priceLine, { color: T.textSecondary }]}>
          Price:{' '}
          <Text style={styles.strike}>PKR {item.oldPrice.toLocaleString()}</Text>
          {' → '}
          <Text style={{ color: T.text, fontWeight: '600' }}>PKR {item.newPrice?.toLocaleString()}</Text>
        </Text>
      ) : (
        <TouchableOpacity>
          <Text style={[styles.link, { color: T.accent }]}>View Ad Creative →</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

export const CompetitorAlertsModal = ({ visible, onClose, alerts }: CompetitorAlertsModalProps) => {
  const T = useTheme();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const dotScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, { toValue: 1.4, duration: 600, useNativeDriver: true }),
        Animated.timing(dotScale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible]);

  const filtered = useMemo(() => {
    if (filter === 'All') return alerts;
    return alerts.filter((a) => a.type === filter);
  }, [alerts, filter]);

  return (
    <SpotlightModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Animated.View
            style={[styles.liveDot, { backgroundColor: '#EF4444', transform: [{ scale: dotScale }] }]}
          />
          <Text style={[styles.title, { color: T.text }]}>Live Competitor Alerts</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={22} color={T.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.pill,
                {
                  backgroundColor: active ? T.btnPrimary : T.btnSecondary,
                  borderColor: T.border,
                },
              ]}
            >
              <Text style={{ color: active ? T.btnPrimaryText : T.textSecondary, fontSize: 12, fontWeight: '600' }}>
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        renderItem={({ item, index }) => <AlertRow item={item} index={index} accent={T.accent} />}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SpotlightModal>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 20, fontWeight: '800' },
  filters: { marginBottom: 14, maxHeight: 44 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, marginRight: 8 },
  alertCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 14,
    overflow: 'hidden',
  },
  alertTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoImg: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#f4f4f5' },
  logoText: { fontSize: 14, fontWeight: '800' },
  alertMeta: { flex: 1, gap: 4 },
  brandName: { fontSize: 14, fontWeight: '700' },
  time: { fontSize: 11 },
  desc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  priceLine: { fontSize: 12 },
  strike: { textDecorationLine: 'line-through' },
  link: { fontSize: 12, fontWeight: '600' },
});
