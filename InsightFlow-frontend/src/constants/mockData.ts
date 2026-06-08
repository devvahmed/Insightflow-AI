export const APP_DEFAULTS = {
  brandName: 'InsightFlow AI',
  brandPrimaryColor: '#A6C1EE',
  brandSecondaryColor: '#E8F0FC',
  brandSlogan: 'Autonomous Campaign Planning & Marketing Intelligence',
  appLogo: require('../../assets/insightflow-logo.png'),
};

export const DASHBOARD_WEEKLY_SALES = [45200, 51800, 48600, 61200, 55800, 67100, 70400, 85200];
export const DASHBOARD_SALES_TARGET = [42000, 45000, 47000, 50000, 52000, 55000, 58000, 60000];
export const DASHBOARD_WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];

export const DASHBOARD_AI_INSIGHT =
  'Competitor discount activity is rising in your category. Launch a counter-campaign on high-margin SKUs within 48 hours to protect share in Karachi and Lahore.';

export const DASHBOARD_METRICS = [
  { id: 'campaigns', icon: 'bar-chart-2', label: 'Campaigns', value: '3', lib: 'Feather' as const },
  { id: 'alerts', icon: 'bell', label: 'Competitor Alerts', value: '4', lib: 'Feather' as const, pulse: true },
  { id: 'growth', icon: 'trending-up', label: 'Sales Growth', value: '+47%', lib: 'Feather' as const },
];

export const MOCK_CAMPAIGNS = [
  {
    id: '01',
    name: 'Eid Mega Sale',
    date: 'Mar 28, 2025',
    status: 'Completed' as const,
    spend: 85000,
    reach: 142000,
    roi: 47,
    platforms: { instagram: 40, tiktok: 35, facebook: 25 },
    revenueContribution: 38,
    revenueAmount: 912000,
  },
  {
    id: '02',
    name: 'Summer Launch',
    date: 'Apr 15, 2025',
    status: 'Completed' as const,
    spend: 60000,
    reach: 98000,
    roi: 31,
    platforms: { instagram: 50, tiktok: 30, facebook: 20 },
    revenueContribution: 28,
    revenueAmount: 672000,
  },
  {
    id: '03',
    name: 'Brand Awareness Push',
    date: 'May 01, 2025',
    status: 'Active' as const,
    spend: 45000,
    reach: 76000,
    roi: 22,
    platforms: { instagram: 60, tiktok: 25, facebook: 15 },
    revenueContribution: 34,
    revenueAmount: 816000,
  },
];

export const MOCK_ALERTS = [
  {
    id: '1',
    brand: 'Outfitters',
    type: 'Price Drop' as const,
    description: 'Dropped denim jacket price by PKR 800 — now PKR 3,200',
    oldPrice: 4000,
    newPrice: 3200,
    timeAgo: '2h ago',
    platforms: ['instagram', 'tiktok'] as const,
  },
  {
    id: '2',
    brand: 'Khaadi',
    type: 'New Ad' as const,
    description: 'Launched 3 new Reels targeting 18-25 females in Karachi',
    timeAgo: '4h ago',
    platforms: ['instagram', 'facebook'] as const,
    adHeadline: 'Lawn Collection 2025 — Limited Stock',
  },
  {
    id: '3',
    brand: 'Bonanza Satrangi',
    type: 'Flash Sale' as const,
    description: '50% off sitewide — 24 hour flash sale running now',
    timeAgo: '6h ago',
    platforms: ['facebook', 'tiktok'] as const,
  },
  {
    id: '4',
    brand: 'Alkaram',
    type: 'Stock Alert' as const,
    description: 'Running low on summer collection — possible stockout',
    timeAgo: '1d ago',
    platforms: ['instagram'] as const,
  },
];

export type MockCompetitor = {
  id: string;
  brand: string;
  initials: string;
  activeAds: number;
  lastSeen: string;
  threatLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  trend: 'up' | 'down';
  sparkline: number[];
  theirPrice: number;
  yourPrice: number;
  platforms: ('instagram' | 'tiktok' | 'facebook')[];
  recentAd: string;
};

export const MOCK_COMPETITORS: MockCompetitor[] = [
  {
    id: '1',
    brand: 'Outfitters',
    initials: 'OF',
    activeAds: 7,
    lastSeen: '2h ago',
    threatLevel: 'HIGH',
    trend: 'up',
    sparkline: [30, 45, 38, 52, 61, 58, 70],
    theirPrice: 3200,
    yourPrice: 3700,
    platforms: ['instagram', 'tiktok', 'facebook'],
    recentAd: 'New summer arrivals — shop now before stock runs out!',
  },
  {
    id: '2',
    brand: 'Khaadi',
    initials: 'KH',
    activeAds: 4,
    lastSeen: '4h ago',
    threatLevel: 'MEDIUM',
    trend: 'up',
    sparkline: [50, 48, 55, 52, 60, 58, 62],
    theirPrice: 2800,
    yourPrice: 2600,
    platforms: ['instagram', 'facebook'],
    recentAd: 'Exclusive lawn prints — Eid collection 2025',
  },
  {
    id: '3',
    brand: 'Bonanza',
    initials: 'BN',
    activeAds: 2,
    lastSeen: '1d ago',
    threatLevel: 'LOW',
    trend: 'down',
    sparkline: [60, 55, 52, 48, 45, 43, 40],
    theirPrice: 2200,
    yourPrice: 2600,
    platforms: ['facebook'],
    recentAd: 'Flash sale — 50% off all categories today only',
  },
];
