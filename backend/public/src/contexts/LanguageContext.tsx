import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import enTranslations from '../locales/en.json';
import hiTranslations from '../locales/hi.json';
import taTranslations from '../locales/ta.json';

// Define types
interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
  translationsLoaded: boolean;
}

// Extend the translation structure type as needed
interface TranslationStructure {
  [key: string]: any;
}

interface LanguageProviderProps {
  children: ReactNode;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<TranslationStructure>({});
  const [translationsLoaded, setTranslationsLoaded] = useState<boolean>(false);

  // Load translations when language changes
  useEffect(() => {
    console.log(`Loading translations for ${language}`);
    setTranslationsLoaded(false); // Reset loading state
    
    // Select the appropriate translation object based on language
    let selectedTranslations;
    switch (language) {
      case 'hi':
        selectedTranslations = hiTranslations;
        break;
      case 'ta':
        selectedTranslations = taTranslations;
        break;
      case 'en':
      default:
        selectedTranslations = enTranslations;
        break;
    }
    
    setTranslations(selectedTranslations);
    setTranslationsLoaded(true);
    console.log(`Loaded translations for ${language}`, selectedTranslations);
  }, [language]);

  // Function to get translated text by key
  const t = (key: string): string => {
    // Split the key by dots to navigate nested objects
    const keys = key.split('.');
    let result: any = translations;

    // Debug: log the translation object structure
    console.log('Translation object structure:', translations);
    console.log('Looking up key:', key);

    for (const k of keys) {
      console.log(`Checking key part: ${k}`, result);
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
        console.log(`Found key part: ${k}`, result);
      } else {
        // Return the key if translation not found
        console.warn(`Translation not found for key: ${key}`);
        return key;
      }
    }

    console.log(`Final result for ${key}:`, result);
    return typeof result === 'string' ? result : key;
  };

  // Load user's preferred language from localStorage on initial load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translationsLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;