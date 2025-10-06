// client/app/i18n/index.js
import i18n from 'i18next';

// Make i18n available globally for the I18nProvider
if (typeof window !== 'undefined') {
  window.i18n = i18n;
}

export default i18n;