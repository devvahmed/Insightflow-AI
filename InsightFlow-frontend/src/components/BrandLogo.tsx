import React from 'react';
import { Image, View, Text } from 'react-native';
import { useAuthStore } from '../store/userStore';
import { useTheme } from '../theme/useTheme';
import { resolveMediaUrl } from '../utils/mediaUrl';

export const BrandAvatar = () => {
  const user = useAuthStore(state => state.user);
  const T = useTheme();
  const [imgError, setImgError] = React.useState(false);

  const rawLogo = user?.logo_url || user?.logo_path || '';
  const logoUri = resolveMediaUrl(rawLogo) || '';

  const initials = (user?.brand_name || 'B')
    .split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  if (logoUri && !imgError) {
    return (
      <Image
        source={{ uri: logoUri }}
        style={{
          width: 40, height: 40, borderRadius: 10,
          backgroundColor: T.accent + '22',
        }}
        resizeMode="contain"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <View style={{
      width: 40, height: 40, borderRadius: 10,
      backgroundColor: T.accent + '33',
      justifyContent: 'center', alignItems: 'center',
    }}>
      <Text style={{ color: T.accent, fontWeight: '800', fontSize: 16 }}>
        {initials}
      </Text>
    </View>
  );
};

export const BrandLogo = BrandAvatar;
