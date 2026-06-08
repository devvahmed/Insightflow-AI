import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SpotlightModal } from './SpotlightModal';
import { useTheme } from '../../theme/useTheme';
import { PrimaryButton } from '../ui/PrimaryButton';
import { fadeIn, slideUp } from '../../utils/animations';
import { Animated } from 'react-native';

import { DashboardCampaign } from '../../utils/dashboardData';

type Campaign = DashboardCampaign;

interface CampaignsModalProps {
  visible: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  onStartCampaign?: () => void;
}

const PLATFORM_COLORS = {
  instagram: null as string | null,
  tiktok: '#FF0050',
  facebook: '#1877F2',
};

function CampaignRow({ item, index }: { item: Campaign; index: number }) {
  const T = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const isActive = item.status === 'Active';

  useEffect(() => {
    Animated.parallel([fadeIn(opacity, index * 60), slideUp(translateY, index * 60)]).start();
  }, [index]);

  const total = item.platforms.instagram + item.platforms.tiktok + item.platforms.facebook;

  return (
    <Animated.View
      style={[
        styles.card,
        T.shadow,
        {
          backgroundColor: T.card,
          borderColor: T.border,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.numBadge, { backgroundColor: T.withAlpha(T.accent, 0.12) }]}>
          <Text style={[styles.numText, { color: T.accent }]}>{item.id}</Text>
        </View>
        <View style={styles.titleCol}>
          <Text style={[styles.name, { color: T.text }]}>{item.name}</Text>
          <Text style={[styles.date, { color: T.textSecondary }]}>{item.date}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isActive ? T.withAlpha('#22C55E', 0.15) : T.btnSecondary },
          ]}
        >
          <Text style={{ color: isActive ? '#22C55E' : T.textSecondary, fontSize: 11, fontWeight: '600' }}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.barRow}>
        <View
          style={[styles.barSeg, { flex: item.platforms.instagram, backgroundColor: T.accent }]}
        />
        <View
          style={[styles.barSeg, { flex: item.platforms.tiktok, backgroundColor: '#FF0050' }]}
        />
        <View
          style={[styles.barSeg, { flex: item.platforms.facebook, backgroundColor: '#1877F2' }]}
        />
      </View>
      <View style={styles.barLabels}>
        <Text style={[styles.barLabel, { color: T.textSecondary }]}>IG {Math.round((item.platforms.instagram / total) * 100)}%</Text>
        <Text style={[styles.barLabel, { color: T.textSecondary }]}>TT {Math.round((item.platforms.tiktok / total) * 100)}%</Text>
        <Text style={[styles.barLabel, { color: T.textSecondary }]}>FB {Math.round((item.platforms.facebook / total) * 100)}%</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={[styles.stat, { color: T.textSecondary }]}>Spend: PKR {(item.spend / 1000).toFixed(0)}k</Text>
        <Text style={[styles.stat, { color: T.textSecondary }]}>Reach: {(item.reach / 1000).toFixed(0)}k</Text>
        <Text style={[styles.roi, { color: '#22C55E' }]}>ROI: +{item.roi}%</Text>
      </View>
    </Animated.View>
  );
}

export const CampaignsModal = ({
  visible,
  onClose,
  campaigns,
  onStartCampaign,
}: CampaignsModalProps) => {
  const T = useTheme();

  return (
    <SpotlightModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: T.text }]}>Campaign History</Text>
        <TouchableOpacity onPress={onClose} hitSlop={12}>
          <Feather name="x" size={22} color={T.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.subtitle, { color: T.textSecondary }]}>
        {campaigns.length} campaigns total
      </Text>

      {campaigns.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="inbox" size={48} color={T.textMuted} />
          <Text style={[styles.emptyText, { color: T.textSecondary }]}>No campaigns yet</Text>
          <PrimaryButton label="Start First Campaign" onPress={() => { onClose(); onStartCampaign?.(); }} />
        </View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(c) => c.id}
          renderItem={({ item, index }) => <CampaignRow item={item} index={index} />}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </SpotlightModal>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  numBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  numText: { fontSize: 12, fontWeight: '800' },
  titleCol: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  date: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  barRow: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  barSeg: { height: '100%' },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  barLabel: { fontSize: 10 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { fontSize: 12 },
  roi: { fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 15 },
});
