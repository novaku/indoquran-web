// Define types for user preferences
export interface QuranFontPreferences {
  fontFamily: string; // Arabic font family: 'naskh', 'amiri', 'uthmani'
  fontSize: number;    // Font size in rem (e.g., 1.5, 2.0, 2.5)
}

// Default font preferences if none are set
export const DEFAULT_QURAN_FONT_PREFS: QuranFontPreferences = {
  fontFamily: 'uthmani',
  fontSize: 2.0
};
