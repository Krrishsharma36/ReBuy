import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type ScreenType = 'home' | 'details' | 'timeline' | 'settings' | 'about';

interface NavigationContextProps {
  currentScreen: ScreenType;
  selectedItemId: string | null;
  history: ScreenType[];
  navigateTo: (screen: ScreenType, itemId?: string | null) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [history, setHistory] = useState<ScreenType[]>(['home']);

  // Handle browser popstate to allow back button navigation in browser history
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        setCurrentScreen(event.state.screen);
        setSelectedItemId(event.state.itemId || null);
      } else {
        setCurrentScreen('home');
        setSelectedItemId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (screen: ScreenType, itemId: string | null = null) => {
    setCurrentScreen(screen);
    setSelectedItemId(itemId);
    setHistory((prev) => [...prev, screen]);
    
    // Update browser URL query/state to make links and back-navigation work
    const path = screen === 'home' ? '' : `?page=${screen}${itemId ? `&id=${itemId}` : ''}`;
    const base = window.location.pathname;
    window.history.pushState({ screen, itemId }, '', `${base}${path}`);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current
      const prevScreen = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentScreen(prevScreen);
      setSelectedItemId(null);
      window.history.back();
    } else {
      navigateTo('home');
    }
  };

  return (
    <NavigationContext.Provider value={{ currentScreen, selectedItemId, history, navigateTo, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
export { NavigationContext };
