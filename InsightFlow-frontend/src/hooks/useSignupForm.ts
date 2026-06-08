import { useState } from 'react';

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  brandName: string;
  websiteUrl: string;
  logoUri: string | null;
  industry: string;
  socialHandles: {
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
    linkedin: string | null;
  };
  termsAccepted: boolean;
}

const initialForm: SignupFormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  brandName: '',
  websiteUrl: '',
  logoUri: null,
  industry: '',
  socialHandles: {
    facebook: null,
    instagram: null,
    tiktok: null,
    linkedin: null,
  },
  termsAccepted: false,
};

export const useSignupForm = () => {
  const [form, setForm] = useState<SignupFormData>(initialForm);

  const update = <K extends keyof SignupFormData>(key: K, value: SignupFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSocial = (platform: keyof SignupFormData['socialHandles'], handle: string | null) => {
    setForm((prev) => ({
      ...prev,
      socialHandles: { ...prev.socialHandles, [platform]: handle },
    }));
  };

  const reset = () => setForm(initialForm);

  return { form, update, updateSocial, reset };
};
