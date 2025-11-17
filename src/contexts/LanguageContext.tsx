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
    'nav.albums': 'Альбомы',
    'nav.videos': 'Клипы',
    'hero.subtitle': 'Певица | Композитор | Исполнитель',
    'hero.cta': 'Смотреть галерею',
    'stats.total': 'Всего посетителей',
    'stats.today': 'За 24 часа',
    'about.title': 'О себе',
    'about.p1': 'NARGIZA — современная Казахская исполнительница, активно развивающаяся на российской музыкальной сцене с 2025 года.',
    'about.p2': 'Музыкальный стиль сочетает лирические композиции с социально значимыми произведениями.',
    'about.p3': 'Проект создавался самой исполнительницей для поддержки России в трудное военное время. Самой исполнительницей написано много песен на военную тему.',
    'about.p4': 'Последнее время после знакомства и совместной работе с музыкантом Calla Vivid часто применяется в исполнении стиль хип хоп и музыкальный стиль инди. Этот совместный творческий союз принёс положительный результат в новых композициях, которые стали более изящными и индивидуальными.',
    'discography.title': 'Дискография',
    'discography.albums': 'Альбомы',
    'discography.singles': 'Синглы',
    'album.worthless': 'Никчёмная жизнь',
    'latest.title': 'Последние клипы',
    'latest.view': 'Смотреть',
    'gallery.title': 'Галерея',
    'gallery.subtitle': 'Фотографии и моменты из жизни артистки',
    'footer.copyright': '© 2025 NARGIZA. Все права защищены.',
    'videos.title': 'Клипы',
    'videos.back': 'Главная',
    'videos.loading': 'Загрузка...',
    'videos.watch': 'Смотреть на YouTube',
    'videos.published': 'Опубликовано',
    'meta.home.title': 'NARGIZA — Официальный сайт певицы и композитора',
    'meta.home.description': 'NARGIZA — современная казахская исполнительница. Слушайте новые песни, смотрите клипы, читайте о творчестве и следите за новостями.',
    'meta.videos.title': 'Клипы NARGIZA — Смотреть все видео онлайн | Официальный сайт',
    'meta.videos.description': 'Смотрите все клипы NARGIZA онлайн. Последние видео с YouTube канала @nargizamuz — новые релизы, хиты и эксклюзивные премьеры.',
    'meta.gallery.title': 'Галерея NARGIZA — Фото певицы | Официальный сайт',
    'meta.gallery.description': 'Фотогалерея NARGIZA — фото с концертов, фотосессий и моментов из жизни артистки. Смотрите все фотографии онлайн.',
    'tracks.title': 'Новые треки',
    'tracks.subtitle': 'Последние музыкальные релизы',
    'tracks.listen': 'Слушать на Яндекс Музыке',
    'tracks.player': 'Слушать онлайн',
  },
  en: {
    'nav.home': 'Home',
    'nav.gallery': 'Gallery',
    'nav.albums': 'Albums',
    'nav.videos': 'Videos',
    'hero.subtitle': 'Singer | Composer | Performer',
    'hero.cta': 'View Gallery',
    'stats.total': 'Total Visitors',
    'stats.today': 'Last 24 Hours',
    'about.title': 'About Me',
    'about.p1': 'NARGIZA is a modern Kazakh artist actively developing on the Russian music scene since 2025.',
    'about.p2': 'Her musical style combines lyrical compositions with socially significant works.',
    'about.p3': 'The project was created by the artist herself to support Russia during difficult wartime. She has written many songs on military themes.',
    'about.p4': 'Recently, after meeting and collaborating with musician Calla Vivid, hip-hop and indie music styles are often used in her performances. This creative partnership has brought positive results in new compositions that have become more elegant and distinctive.',
    'discography.title': 'Discography',
    'discography.albums': 'Albums',
    'discography.singles': 'Singles',
    'album.worthless': 'Worthless Life',
    'latest.title': 'Latest Videos',
    'latest.view': 'Watch',
    'gallery.title': 'Gallery',
    'gallery.subtitle': 'Photos and moments from the artist\'s life',
    'footer.copyright': '© 2025 NARGIZA. All rights reserved.',
    'videos.title': 'Video Clips',
    'videos.back': 'Home',
    'videos.loading': 'Loading...',
    'videos.watch': 'Watch on YouTube',
    'videos.published': 'Published',
    'meta.home.title': 'NARGIZA — Official Website of Singer and Composer',
    'meta.home.description': 'NARGIZA is a modern Kazakh artist. Listen to new songs, watch music videos, learn about her work and follow the latest news.',
    'meta.videos.title': 'NARGIZA Music Videos — Watch All Videos Online | Official Website',
    'meta.videos.description': 'Watch all NARGIZA music videos online. Latest videos from YouTube channel @nargizamuz — new releases, hits and exclusive premieres.',
    'meta.gallery.title': 'NARGIZA Gallery — Singer Photos | Official Website',
    'meta.gallery.description': 'NARGIZA photo gallery — photos from concerts, photo shoots and moments from the artist\'s life. View all photos online.',
    'tracks.title': 'New Tracks',
    'tracks.subtitle': 'Latest music releases',
    'tracks.listen': 'Listen on Yandex Music',
    'tracks.player': 'Listen Online',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const detectBrowserLanguage = (): Language => {
  const saved = localStorage.getItem('language');
  if (saved === 'en' || saved === 'ru') {
    return saved;
  }
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ru')) {
    return 'ru';
  }
  
  return 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => detectBrowserLanguage());

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