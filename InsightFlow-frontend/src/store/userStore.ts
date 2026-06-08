import { create } from 'zustand';
import { APP_DEFAULTS } from '../constants/mockData';
import { resolveMediaUrl } from '../utils/mediaUrl';

const DEFAULT_BRAND_COLOR = '#0A84FF';

export interface InsightFlowUser {
  id: string;
  email: string;
  full_name: string;
  brand_name: string;
  primaryColor: string;
  secondaryColor: string;
  slogan: string;
  brandKeywords: string[];
  industry: string;
  socialHandles: Record<string, string>;
  logo_path: string;
  logo_url: string;
  analyses: unknown[];
  campaigns: unknown[];
  website_url?: string;
}

export interface UserProfile {
  email: string;
  business_name: string;
  website_url: string;
  brand_color: string;
  brand_persona: string;
  business_type: string;
  apply_brand_theme: boolean;
  logo_url?: string;
}

interface UserState {
  token: string | null;
  user: InsightFlowUser | null;
  latestAnalysis: Record<string, unknown> | null;
  latestCampaign: Record<string, unknown> | null;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  isDarkMode: boolean;
  brandColor: string | null;
  logoUrl: string | null;
  businessName: string | null;
  brand_color: string | null;
  logo_url: string | null;
  business_name: string | null;
  brandPrimaryColor: string | null;
  brandSecondaryColor: string | null;
  brandSlogan: string | null;
  themeColor: (() => string) & { toString: () => string; valueOf: () => string };

  setAuth: (token: string, user: Record<string, unknown>) => void;
  logout: () => void;
  setAnalysis: (analysis: Record<string, unknown>) => void;
  setCampaign: (campaign: Record<string, unknown>) => void;
  login: (profile: Record<string, unknown>) => void;
  toggleDarkMode: () => void;
}

function mapApiUserToProfile(user: Record<string, unknown>): InsightFlowUser {
  return {
    id: String(user.id || ''),
    email: String(user.email || ''),
    full_name: String(user.full_name || user.business_name || ''),
    brand_name: String(user.brand_name || user.business_name || ''),
    primaryColor: String(user.primaryColor || user.brand_color || APP_DEFAULTS.brandPrimaryColor),
    secondaryColor: String(user.secondaryColor || APP_DEFAULTS.brandSecondaryColor),
    slogan: String(user.slogan || user.brand_persona || ''),
    brandKeywords: (user.brandKeywords as string[]) || [],
    industry: String(user.industry || user.business_type || 'generic'),
    socialHandles: (user.socialHandles as Record<string, string>) || {},
    logo_path: String(user.logo_path || user.logo_url || ''),
    logo_url: String(user.logo_url || user.logo_path || ''),
    analyses: (user.analyses as unknown[]) || [],
    campaigns: (user.campaigns as unknown[]) || [],
    website_url: String(user.website_url || ''),
  };
}

function applyUserTheme(
  set: (partial: Partial<UserState>) => void,
  mapped: InsightFlowUser
) {
  const primary = mapped.primaryColor || APP_DEFAULTS.brandPrimaryColor;
  const secondary = mapped.secondaryColor || APP_DEFAULTS.brandSecondaryColor;
  const resolvedLogo = resolveMediaUrl(mapped.logo_path) || mapped.logo_path || undefined;
  set({
    isAuthenticated: true,
    user: mapped,
    userProfile: {
      email: mapped.email,
      business_name: mapped.brand_name,
      website_url: mapped.website_url || '',
      brand_color: primary,
      brand_persona: mapped.slogan,
      business_type: mapped.industry,
      apply_brand_theme: true,
      logo_url: resolvedLogo,
    },
    brandColor: primary,
    logoUrl: resolvedLogo || null,
    businessName: mapped.brand_name,
    brand_color: primary,
    logo_url: resolvedLogo || null,
    business_name: mapped.brand_name,
    brandPrimaryColor: primary,
    brandSecondaryColor: secondary,
    brandSlogan: mapped.slogan || APP_DEFAULTS.brandSlogan,
  });
}

export const useUserStore = create<UserState>((set, get) => ({
  token: null,
  user: null,
  latestAnalysis: null,
  latestCampaign: null,
  isAuthenticated: false,
  userProfile: null,
  isDarkMode: false,
  brandColor: null,
  logoUrl: null,
  businessName: null,
  brand_color: null,
  logo_url: null,
  business_name: null,
  brandPrimaryColor: APP_DEFAULTS.brandPrimaryColor,
  brandSecondaryColor: APP_DEFAULTS.brandSecondaryColor,
  brandSlogan: APP_DEFAULTS.brandSlogan,

  themeColor: (() => {
    const fn = () => {
      const profile = get().userProfile;
      if (profile?.apply_brand_theme && profile?.brand_color) {
        return profile.brand_color;
      }
      return get().brandPrimaryColor || get().brandColor || DEFAULT_BRAND_COLOR;
    };
    fn.toString = () => {
      const profile = get().userProfile;
      if (profile?.apply_brand_theme && profile?.brand_color) {
        return profile.brand_color;
      }
      return get().brandPrimaryColor || get().brandColor || DEFAULT_BRAND_COLOR;
    };
    fn.valueOf = fn.toString;
    return fn as UserState['themeColor'];
  })(),

  setAuth: (token, user) => {
    const BASE = 'http://localhost:8000';
    
    // Fix logo_url — always make it a full URL
    let logoUrl = (user.logo_url || user.logo_path || '') as string;
    if (logoUrl && !logoUrl.startsWith('http')) {
      logoUrl = BASE + logoUrl;
    }
    
    const mapped = mapApiUserToProfile({
      ...user,
      logo_url: logoUrl,
    });

    set({
      token,
      user: mapped,
    });
    applyUserTheme(set, mapped);
  },

  logout: () =>
    set({
      token: null,
      user: null,
      latestAnalysis: null,
      latestCampaign: null,
      isAuthenticated: false,
      userProfile: null,
      brandColor: null,
      logoUrl: null,
      businessName: null,
      brand_color: null,
      logo_url: null,
      business_name: null,
      brandPrimaryColor: APP_DEFAULTS.brandPrimaryColor,
      brandSecondaryColor: APP_DEFAULTS.brandSecondaryColor,
      brandSlogan: APP_DEFAULTS.brandSlogan,
    }),

  setAnalysis: (analysis) => {
    const current = get().user;
    const analyses = current?.analyses ? [...current.analyses, analysis] : [analysis];
    if (current) {
      set({
        latestAnalysis: analysis,
        user: { ...current, analyses },
      });
    } else {
      set({ latestAnalysis: analysis });
    }
  },

  setCampaign: (campaign) => {
    const current = get().user;
    const campaigns = current?.campaigns ? [...current.campaigns, campaign] : [campaign];
    if (current) {
      set({
        latestCampaign: campaign,
        user: { ...current, campaigns },
      });
    } else {
      set({ latestCampaign: campaign });
    }
  },

  login: (profile) => {
    get().setAuth(get().token || 'legacy', profile);
  },

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));

export const useAuthStore = useUserStore;
