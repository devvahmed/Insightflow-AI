import { Platform } from 'react-native';
import { useUserStore } from '../store/userStore';
import { getApiBaseUrl } from '../config/backend';

export const BASE_URL = getApiBaseUrl();
console.log('[API Connection] Resolved Backend URL:', BASE_URL);

const SIGNUP_TIMEOUT_MS = 90000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = SIGNUP_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        'Request timed out. Check that the backend is running and your phone is on the same Wi‑Fi as your PC.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((d: { msg?: string; loc?: string[] }) =>
          d.loc ? `${d.loc.join('.')}: ${d.msg}` : d.msg
        )
        .join('; ');
    }
    if (typeof data.detail === 'string') return data.detail;
    return data.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

function normalizeLogoUri(uri: string): string {
  if (Platform.OS === 'android' && uri && !uri.startsWith('file://') && !uri.startsWith('http')) {
    return `file://${uri}`;
  }
  return uri;
}

// ── AUTH ─────────────────────────────────────────────────

export async function signupApi(data: {
  email: string;
  password: string;
  full_name: string;
  brand_name: string;
  industry?: string;
  website_url?: string;
  social_instagram?: string;
  social_tiktok?: string;
  social_facebook?: string;
  logo?: { uri: string; fileName?: string; type?: string } | null;
}) {
  const payload = {
    email: data.email.trim(),
    password: data.password,
    full_name: data.full_name?.trim() || data.brand_name?.trim() || 'User',
    brand_name: data.brand_name?.trim() || data.full_name?.trim() || 'My Brand',
    industry: data.industry || '',
    website_url: data.website_url || '',
    social_instagram: data.social_instagram || '',
    social_tiktok: data.social_tiktok || '',
    social_facebook: data.social_facebook || '',
  };

  if (!data.logo?.uri) {
    const res = await fetchWithTimeout(`${BASE_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  }

  const form = new FormData();
  Object.entries(payload).forEach(([key, val]) => form.append(key, String(val)));

  if (Platform.OS === 'web') {
    try {
      const response = await fetch(data.logo.uri);
      const blob = await response.blob();
      form.append('logo', blob, data.logo.fileName || 'logo.png');
    } catch (e) {
      console.error('[API] Failed to fetch web blob for logo upload:', e);
      form.append('logo', {
        uri: data.logo.uri,
        name: data.logo.fileName || 'logo.jpg',
        type: data.logo.type || 'image/jpeg',
      } as unknown as Blob);
    }
  } else {
    const uri = normalizeLogoUri(data.logo.uri);
    form.append('logo', {
      uri,
      name: data.logo.fileName || 'logo.jpg',
      type: data.logo.type || 'image/jpeg',
    } as unknown as Blob);
  }

  const res = await fetchWithTimeout(`${BASE_URL}/api/signup`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function loginApi(email: string, password: string) {
  const form = new FormData();
  form.append('email', email);
  form.append('password', password);

  const res = await fetchWithTimeout(
    `${BASE_URL}/api/login`,
    { method: 'POST', body: form },
    30000
  );
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// ── HELPERS ──────────────────────────────────────────────

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function authFormHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function getToken(): string {
  const token = useUserStore.getState().token;
  if (!token) throw new Error('Not authenticated. Please log in again.');
  return token;
}

// ── ANALYSIS ─────────────────────────────────────────────

export async function analyzeApi(
  token: string,
  data: {
    sales_data: string;
    social_reviews: string;
    stock_balance: number;
    marketing_spend: number;
    leads_csv?: string;
  }
) {
  const form = new FormData();
  form.append('sales_data', data.sales_data);
  form.append('social_reviews', data.social_reviews);
  form.append('stock_balance', String(data.stock_balance));
  form.append('marketing_spend', String(data.marketing_spend));
  if (data.leads_csv) form.append('leads_csv', data.leads_csv);

  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: authFormHeaders(token),
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// ── CAMPAIGNS ────────────────────────────────────────────

export async function launchCampaignApi(
  token: string,
  payload: {
    campaign_name?: string;
    budget?: number;
    platforms?: string[];
    reach?: number;
    analysis_id?: string;
  }
) {
  const res = await fetch(`${BASE_URL}/api/campaigns/launch`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function generateCampaignApi(token: string, analysis_id: string) {
  const form = new FormData();
  form.append('analysis_id', analysis_id);

  const res = await fetch(`${BASE_URL}/api/generate-campaign`, {
    method: 'POST',
    headers: authFormHeaders(token),
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function approveCampaignApi(
  token: string,
  campaign_id: string,
  platforms: string[]
) {
  const res = await fetch(`${BASE_URL}/api/approve`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ campaign_id, platforms }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// ── COMPETITORS ──────────────────────────────────────────

export async function getCompetitorsApi(token: string, refresh = true) {
  const qs = refresh ? '?refresh=true' : '';
  const res = await fetch(`${BASE_URL}/api/competitors/live${qs}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// ── TRENDS ───────────────────────────────────────────────

export async function getTrendsApi() {
  const res = await fetch(`${BASE_URL}/api/trends`);
  if (!res.ok) throw new Error('Failed to fetch trends');
  return res.json();
}

// ── USER PROFILE ─────────────────────────────────────────

export async function getMeApi(token: string) {
  const res = await fetch(`${BASE_URL}/api/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

// ── TRACE ────────────────────────────────────────────────

export async function getTraceApi(token: string, job_id: string) {
  const res = await fetch(`${BASE_URL}/api/trace/${job_id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Trace not found');
  return res.json();
}

// ── DEMO SCENARIOS ───────────────────────────────────────

export async function loadScenarioApi(scenario_id: string) {
  const res = await fetch(`${BASE_URL}/api/load-scenario/${scenario_id}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Scenario not found');
  return res.json();
}

// ── LEGACY WRAPPERS (existing screens) ───────────────────

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function registerUser(
  email: string,
  password: string,
  businessName: string,
  websiteUrl: string,
  applyBrandTheme: boolean = true,
  businessType: string = 'generic',
  products: string = ''
) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      business_name: businessName,
      website_url: websiteUrl,
      apply_brand_theme: applyBrandTheme,
      business_type: businessType,
      products,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function registerSignupMultipart(payload: {
  email: string;
  password: string;
  websiteUrl?: string;
  logoUri?: string | null;
  social: {
    facebook: boolean;
    instagram: boolean;
    tiktok: boolean;
    linkedin: boolean;
  };
  fullName?: string;
  brandName?: string;
  industry?: string;
}) {
  return signupApi({
    email: payload.email,
    password: payload.password,
    full_name: payload.fullName || payload.email.split('@')[0],
    brand_name: payload.brandName || payload.fullName || 'My Brand',
    industry: payload.industry || 'Fashion/Apparel',
    website_url: payload.websiteUrl,
    social_instagram: payload.social.instagram ? 'connected' : '',
    social_tiktok: payload.social.tiktok ? 'connected' : '',
    social_facebook: payload.social.facebook ? 'connected' : '',
    logo: payload.logoUri ? { uri: payload.logoUri } : null,
  });
}

export async function analyzeData(
  jobId: string,
  inputs: Record<string, unknown>,
  _budget: number,
  _businessLevel: string,
  _businessName?: string,
  _brandColor?: string,
  _scenarioId?: string
) {
  const token = getToken();
  const parsed = {
    sales_data: String(inputs.csv_sales_data || inputs.sales_data || ''),
    social_reviews: String(inputs.social_posts || inputs.social_reviews || ''),
    stock_balance: 0,
    marketing_spend: 0,
    leads_csv: String(inputs.news_text || inputs.leads_csv || ''),
  };
  const pdf = String(inputs.pdf_report || '');
  const inv = pdf.match(/Inventory:\s*(\d+)/i);
  if (inv) parsed.stock_balance = parseInt(inv[1], 10);
  const spend = pdf.match(/Marketing\s+PKR\s*([\d,]+)/i);
  if (spend) parsed.marketing_spend = parseFloat(spend[1].replace(/,/g, ''));

  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
    },
    body: JSON.stringify({
      job_id: jobId,
      inputs: {
        ...inputs,
        sales_data: parsed.sales_data,
        social_reviews: parsed.social_reviews,
        stock_balance: parsed.stock_balance,
        marketing_spend: parsed.marketing_spend,
      },
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getLiveCompetitors(_businessName: string) {
  const token = getToken();
  return getCompetitorsApi(token, true);
}

export async function getTrace(jobId: string) {
  const token = getToken();
  return getTraceApi(token, jobId);
}

export async function loadScenario(id: string) {
  return loadScenarioApi(id);
}

export async function approveCampaign(
  jobId: string,
  budget: number,
  strategy: Record<string, unknown>,
  customerLeads?: string[],
  assets?: Record<string, unknown>,
  businessName?: string,
  brandColor?: string,
  websiteUrl?: string
) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/approve`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      job_id: jobId,
      budget,
      strategy,
      customerLeads,
      ad_copy: assets?.ad_copy,
      image_url: assets?.image_url,
      video_url: assets?.video_url,
      business_name: businessName,
      brand_color: brandColor,
      website_url: websiteUrl,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function approveCampaignMultipart(formData: FormData) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/approve`, {
    method: 'POST',
    headers: authFormHeaders(token),
    body: formData,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function generateAdCopyApi(
  token: string,
  campaign_id: string,
  tone?: string,
  target_age?: string,
  special_offer?: string,
  extra_message?: string
) {
  const form = new FormData();
  form.append('campaign_id', campaign_id);
  if (tone) form.append('tone', tone);
  if (target_age) form.append('target_age', target_age);
  if (special_offer) form.append('special_offer', special_offer);
  if (extra_message) form.append('extra_message', extra_message);

  const res = await fetch(`${BASE_URL}/api/generate-ad-copy`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Ad copy failed');
  return res.json();
}

export async function generateAdImageApi(
  token: string,
  campaign_id: string,
  platform: string
) {
  const form = new FormData();
  form.append('campaign_id', campaign_id);
  form.append('platform', platform);
  const res = await fetch(`${BASE_URL}/api/generate-ad-image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Image generation failed');
  return res.json();
}

export async function generateAdVideoApi(token: string, campaign_id: string) {
  const form = new FormData();
  form.append('campaign_id', campaign_id);
  const res = await fetch(`${BASE_URL}/api/generate-ad-video`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Video generation failed');
  return res.json();
}

export async function sendEmailCampaignApi(
  token: string,
  payload: {
    campaign_id: string;
    subject: string;
    ad_text: string;
    image_url: string;
    video_url?: string;
    leads_csv_file?: { uri: string; name?: string; type?: string } | null;
    emails?: string[];
  }
) {
  const form = new FormData();
  form.append('campaign_id', payload.campaign_id);
  form.append('subject', payload.subject);
  form.append('ad_text', payload.ad_text);
  form.append('image_url', payload.image_url);
  if (payload.video_url) form.append('video_url', payload.video_url);
  if (payload.emails) form.append('emails', JSON.stringify(payload.emails));

  if (payload.leads_csv_file?.uri) {
    const uri = normalizeLogoUri(payload.leads_csv_file.uri);
    form.append('leads_csv', {
      uri,
      name: payload.leads_csv_file.name || 'leads.csv',
      type: payload.leads_csv_file.type || 'text/csv',
    } as unknown as Blob);
  }

  const res = await fetch(`${BASE_URL}/api/campaign/email-dispatch`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Email outreach dispatch failed');
  }
  return res.json();
}

