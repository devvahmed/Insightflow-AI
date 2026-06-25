import { Platform } from 'react-native';
import Constants from 'expo-constants';

export function getApiBaseUrl(): string {
  try {
    const metroHost =
      Constants.expoConfig?.hostUri ?? Constants.manifest2?.launchAsset?.url ?? '';
    const host = metroHost.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1' && host !== '') {
      return `http://${host}:8000`;
    }
  } catch (_) {}

  if (Platform.OS === 'android') {
    return 'https://insightflow-ai-57zv.onrender.com';
  }

  if (Platform.OS === 'ios') {
    return 'http://localhost:8000';
  }

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:8000`;
    }
    return 'http://localhost:8000';
  }

  return 'http://localhost:8000';
}
