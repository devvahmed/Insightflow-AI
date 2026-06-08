import { DASHBOARD_WEEKS } from '../constants/mockData';
import { resolveMediaUrl } from './mediaUrl';

export type DashboardCampaign = {
  id: string;
  name: string;
  date: string;
  status: 'Completed' | 'Active' | 'Draft';
  spend: number;
  reach: number;
  roi: number;
  platforms: { instagram: number; tiktok: number; facebook: number };
  revenueContribution: number;
  revenueAmount: number;
};

export type DashboardAlert = {
  id: string;
  brand: string;
  type: 'Price Drop' | 'New Ad' | 'Stock Alert' | 'Flash Sale';
  description: string;
  timeAgo: string;
  platforms: ('instagram' | 'tiktok' | 'facebook')[];
  oldPrice?: number;
  newPrice?: number;
  adHeadline?: string;
  logoUrl?: string;
};

export type DashboardCompetitor = {
  id: string;
  brand: string;
  initials: string;
  logoUrl?: string;
  logoFallback?: string;
  activeAds: number;
  lastSeen: string;
  threatLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  trend: 'up' | 'down';
  sparkline: number[];
  theirPrice: number | null;
  yourPrice: number | null;
  priceComparison?: string;
  platforms: ('instagram' | 'tiktok' | 'facebook')[];
  recentAd: string;
  website?: string;
  marketShare?: number;
  strengths?: string[];
  weaknesses?: string[];
  socialFollowers?: { instagram?: number; tiktok?: number; facebook?: number };
  estimatedRevenuePkr?: number;
  raw?: Record<string, unknown>;
};

function parseRoi(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return Math.round(value);
  const n = parseInt(String(value ?? '').replace(/\D/g, ''), 10);
  return Number.isNaN(n) ? 0 : n;
}

function parseRevenuePkr(value: unknown): number {
  if (typeof value === 'number') return value;
  const s = String(value ?? '');
  const nums = s.match(/[\d,]+/g);
  if (!nums?.length) return 0;
  const parsed = parseInt(nums[0].replace(/,/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function inferAlertType(text: string): DashboardAlert['type'] {
  const t = text.toLowerCase();
  if (t.includes('flash') || t.includes('% off') || t.includes('sale')) return 'Flash Sale';
  if (t.includes('price') || t.includes('cheaper') || t.includes('drop')) return 'Price Drop';
  if (t.includes('stock') || t.includes('inventory')) return 'Stock Alert';
  return 'New Ad';
}

function trendSparkline(trend: string, threat: string): number[] {
  const up = trend !== 'DOWN';
  const base = threat === 'HIGH' ? 55 : threat === 'MEDIUM' ? 45 : 35;
  return Array.from({ length: 7 }, (_, i) =>
    up ? base + i * 3 + (i % 2) * 2 : base - i * 2
  );
}

function platformsFromFollowers(
  followers?: Record<string, number>
): DashboardCompetitor['platforms'] {
  const out: DashboardCompetitor['platforms'] = [];
  if (!followers) return ['instagram', 'tiktok', 'facebook'];
  if (followers.instagram) out.push('instagram');
  if (followers.tiktok) out.push('tiktok');
  if (followers.facebook) out.push('facebook');
  return out.length ? out : ['instagram', 'tiktok', 'facebook'];
}

export function mergeCampaignLists(
  ...lists: DashboardCampaign[][]
): DashboardCampaign[] {
  const byId = new Map<string, DashboardCampaign>();
  lists.flat().forEach((c) => {
    if (c?.id) byId.set(c.id, c);
  });
  return Array.from(byId.values()).sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  );
}

export function mapApiCampaigns(raw: unknown[]): DashboardCampaign[] {
  if (!Array.isArray(raw) || !raw.length) return [];

  const mapped = raw.map((item, index) => {
    const c = item as Record<string, unknown>;
    const budget = (c.recommended_budget as Record<string, unknown>) || {};
    const outcomes = (c.expected_outcomes as Record<string, unknown>) || {};
    const ig = Number(budget.instagram_pkr) || 0;
    const tt = Number(budget.tiktok_pkr) || 0;
    const fb = Number(budget.facebook_pkr) || 0;
    const totalSpend = Number(budget.total_pkr) || ig + tt + fb;
    const reachStr = String(outcomes.estimated_reach ?? '0');
    const reachMatch = reachStr.match(/[\d,]+/g);
    const reach =
      reachMatch && reachMatch.length >= 2
        ? (parseInt(reachMatch[0].replace(/,/g, ''), 10) +
            parseInt(reachMatch[1].replace(/,/g, ''), 10)) /
          2
        : parseInt((reachMatch?.[0] || '0').replace(/,/g, ''), 10);

    const revenueAmount = parseRevenuePkr(outcomes.estimated_revenue_pkr);
    const roi = parseRoi(outcomes.roi_percentage);
    const created = String(c.created_at || '');
    const dateLabel = created
      ? new Date(created).toLocaleDateString('en-PK', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Recent';

    const platTotal = ig + tt + fb || 1;
    return {
      id: String(c.campaign_id || index + 1).slice(0, 8),
      name: String(c.campaign_name || c.campaign_theme || `Campaign ${index + 1}`),
      date: dateLabel,
      status: (String(c.status || '').toLowerCase() === 'approved'
        ? 'Active'
        : 'Completed') as DashboardCampaign['status'],
      spend: totalSpend,
      reach: Math.round(reach) || 0,
      roi,
      platforms: {
        instagram: Math.round((ig / platTotal) * 100) || 34,
        tiktok: Math.round((tt / platTotal) * 100) || 33,
        facebook: Math.round((fb / platTotal) * 100) || 33,
      },
      revenueContribution: 0,
      revenueAmount,
    };
  });

  const totalRev = mapped.reduce((s, c) => s + c.revenueAmount, 0) || 1;
  return mapped.map((c) => ({
    ...c,
    revenueContribution: totalRev > 0 ? Math.round((c.revenueAmount / totalRev) * 100) : 0,
  }));
}

export function mapApiCompetitors(list: Record<string, unknown>[]): DashboardCompetitor[] {
  return list.map((c, index) => {
    const name = String(c.name || c.brand || 'Competitor');
    const threat = String(c.threat_level || c.threatLevel || 'MEDIUM').toUpperCase();
    const threatLevel = (['HIGH', 'MEDIUM', 'LOW'].includes(threat)
      ? threat
      : 'MEDIUM') as DashboardCompetitor['threatLevel'];
    const trendRaw = String(c.trend || 'STABLE').toUpperCase();
    const campaigns = Array.isArray(c.recent_campaigns) ? c.recent_campaigns : [];
    const followers = (c.social_followers as Record<string, number>) || {};
    const priceComp = String(c.price_comparison || '');

    return {
      id: String(c.id || index + 1),
      brand: name,
      initials: name.slice(0, 2).toUpperCase(),
      logoUrl:
        resolveMediaUrl(String(c.logo_url || '')) ||
        String(c.logo_url || c.logo_fallback || '') ||
        undefined,
      logoFallback: String(c.logo_fallback || ''),
      activeAds: campaigns.length || (c.alert ? 1 : 0),
      lastSeen: c.live_scraped ? 'Live · just now' : 'Live',
      threatLevel,
      trend: trendRaw === 'DOWN' ? 'down' : 'up',
      sparkline: trendSparkline(trendRaw, threatLevel),
      theirPrice: null,
      yourPrice: null,
      priceComparison: priceComp || undefined,
      platforms: platformsFromFollowers(followers),
      recentAd: String(
        c.alert ||
          (campaigns[0] as string) ||
          'Monitoring competitor activity in your category.'
      ),
      website: c.website ? String(c.website) : undefined,
      marketShare: Number(c.market_share_percent) || undefined,
      strengths: Array.isArray(c.strengths) ? (c.strengths as string[]) : [],
      weaknesses: Array.isArray(c.weaknesses) ? (c.weaknesses as string[]) : [],
      socialFollowers: followers,
      estimatedRevenuePkr: Number(c.estimated_monthly_revenue_pkr) || undefined,
      raw: c,
    };
  });
}

export function buildAlertsFromCompetitors(
  competitors: DashboardCompetitor[]
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  competitors.forEach((comp) => {
    const campaigns = Array.isArray(comp.raw?.recent_campaigns)
      ? (comp.raw!.recent_campaigns as string[])
      : [];

    if (comp.recentAd) {
      alerts.push({
        id: `${comp.id}-main`,
        brand: comp.brand,
        type: inferAlertType(comp.recentAd),
        description: comp.recentAd,
        timeAgo: 'Live',
        platforms: comp.platforms,
        logoUrl: comp.logoUrl,
        adHeadline:
          campaigns[0] && campaigns[0] !== comp.recentAd ? String(campaigns[0]) : undefined,
      });
    }

    campaigns.forEach((desc, i) => {
      if (desc === comp.recentAd) return;
      alerts.push({
        id: `${comp.id}-camp-${i}`,
        brand: comp.brand,
        type: inferAlertType(String(desc)),
        description: String(desc),
        timeAgo: 'Recently',
        platforms: comp.platforms,
        logoUrl: comp.logoUrl,
      });
    });
  });
  return alerts;
}

export function computeSalesGrowth(campaigns: DashboardCampaign[]): number {
  if (!campaigns.length) return 0;
  const withRoi = campaigns.filter((c) => c.roi > 0);
  if (!withRoi.length) return 0;
  return Math.round(withRoi.reduce((s, c) => s + c.roi, 0) / withRoi.length);
}

export function computeTotalRevenue(campaigns: DashboardCampaign[]): number {
  return campaigns.reduce((s, c) => s + c.revenueAmount, 0);
}

export function buildWeeklyChart(campaigns: DashboardCampaign[]): {
  data: number[];
  target: number[];
  labels: string[];
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekCount = Math.min(4, Math.ceil(daysInMonth / 7));
  const labels = Array.from({ length: weekCount }, (_, i) => `W${i + 1}`);
  const data = labels.map(() => 0);
  const target = labels.map(() => 0);

  campaigns.forEach((c) => {
    const parsed = Date.parse(c.date);
    if (Number.isNaN(parsed)) {
      data[0] += c.revenueAmount || c.spend;
      return;
    }
    const d = new Date(parsed);
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    const weekIdx = Math.min(weekCount - 1, Math.floor((d.getDate() - 1) / 7));
    const value = c.revenueAmount > 0 ? c.revenueAmount : c.spend;
    data[weekIdx] += value;
  });

  data.forEach((val, i) => {
    target[i] = val > 0 ? Math.round(val * 0.85) : 0;
  });

  if (!campaigns.length) {
    return { data, target, labels };
  }

  return { data, target, labels };
}

export function formatPriceComparisonLabel(comparison?: string): string {
  if (!comparison) return 'No pricing data';
  const c = comparison.toLowerCase();
  if (c.includes('cheaper')) return 'Competitor priced lower';
  if (c.includes('expensive') || c.includes('more_expensive')) return 'Competitor priced higher';
  if (c.includes('same')) return 'Similar pricing vs your brand';
  return comparison.replace(/_/g, ' ');
}
