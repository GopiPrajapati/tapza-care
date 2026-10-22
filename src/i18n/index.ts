import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources } from './resources';

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'hi', 'te'],
  interpolation: { escapeValue: false },
  keySeparator: false,
  returnNull: false,
  initAsync: false,
});

/** Localizes text coming from mock/config data while leaving unknown runtime copy intact. */
export const translateContent = (value: string): string =>
  i18n.t(value, { defaultValue: value });

export default i18n;
