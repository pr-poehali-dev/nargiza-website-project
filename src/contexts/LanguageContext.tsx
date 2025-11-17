import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ru: {
    'nav.home': 'Главная',
    'nav.gallery': 'Галерея',
    'nav.videos': 'Клипы',
    'hero.subtitle': 'Певица | Композитор | Исполнитель',
    'hero.cta': 'Смотреть клипы',
    'stats.total': 'Всего посетителей',
    'stats.today': 'За 24 часа',
    'latest.title': 'Последние клипы',
    'latest.view': 'Смотреть',
    'gallery.title': 'Фотогалерея',
    'footer.copyright': '© 2024 NARGIZA. Все права защищены.',
    'videos.title': 'Видеоклипы',
    'videos.back': 'Назад',
    'videos.loading': 'Загрузка...',
    'videos.watch': 'Смотреть на YouTube',
    'videos.published': 'Опубликовано',
  },
  en: {
    'nav.home': 'Home',
    'nav.gallery': 'Gallery',
    'nav.videos': 'Videos',
    'hero.subtitle': 'Singer | Composer | Performer',
    'hero.cta': 'Watch Videos',
    'stats.total': 'Total Visitors',
    'stats.today': 'Last 24 Hours',
    'latest.title': 'Latest Videos',
    'latest.view': 'Watch',
    'gallery.title': 'Photo Gallery',
    'footer.copyright': '© 2024 NARGIZA. All rights reserved.',
    'videos.title': 'Video Clips',
    'videos.back': 'Back',
    'videos.loading': 'Loading...',
    'videos.watch': 'Watch on YouTube',
    'videos.published': 'Published',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'ru') ? saved : 'ru';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
