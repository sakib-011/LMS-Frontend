// ============================================================
// BookGrid — Global System Settings & Policy Storage Service
// ============================================================

export interface SystemSettings {
  libraryName: string;
  contactEmail: string;
  supportPhone: string;
  address: string;
  currency: string;
  timezone: string;
  language: string;
  allowPublicRegistration: boolean;
  maxBooksPerUser: string;
  maxReservationDays: string;
  finePerDay: string;
  smtpServer?: string;
  smtpPort?: string;
  smtpUser?: string;
  mfaEnabled?: boolean;
}

const STORAGE_KEY = 'bookgrid_system_settings';

const DEFAULT_SETTINGS: SystemSettings = {
  libraryName: 'BookGrid Central Library',
  contactEmail: 'admin@bookgrid.com',
  supportPhone: '+1 (555) 123-4567',
  address: '123 Library Way, Knowledge City',
  currency: 'USD ($)',
  timezone: 'UTC -05:00 Eastern Time',
  language: 'English (US)',
  allowPublicRegistration: true,
  maxBooksPerUser: '5',
  maxReservationDays: '3',
  finePerDay: '0.50',
  smtpServer: 'smtp.bookgrid.edu',
  smtpPort: '587',
  smtpUser: 'notifications@bookgrid.edu',
  mfaEnabled: false
};

export const SettingsStorageService = {
  getSettings: (): SystemSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: Partial<SystemSettings>): SystemSettings => {
    const current = SettingsStorageService.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    return updated;
  }
};
