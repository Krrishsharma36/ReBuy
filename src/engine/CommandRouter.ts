import { ScreenType } from '../context/NavigationContext';
import { ThemeType } from '../context/ThemeContext';

export interface CommandExecutionResult {
  action: 'theme' | 'navigate' | 'backup' | 'restore';
  payload?: ScreenType | ThemeType;
  message: string;
}

export class CommandRouter {
  /**
   * Translates recognized command strings into instructions.
   */
  public static route(commandName: string): CommandExecutionResult | null {
    const cmd = commandName.trim().toLowerCase();

    switch (cmd) {
      case 'dark':
        return {
          action: 'theme',
          payload: 'dark',
          message: 'Switching theme to Dark Mode'
        };
      case 'light':
        return {
          action: 'theme',
          payload: 'light',
          message: 'Switching theme to Light Mode'
        };
      case 'system':
        return {
          action: 'theme',
          payload: 'system',
          message: 'Switching theme to System Default'
        };
      case 'settings':
        return {
          action: 'navigate',
          payload: 'settings',
          message: 'Navigating to Settings'
        };
      case 'about':
        return {
          action: 'navigate',
          payload: 'about',
          message: 'Navigating to About ReBuy'
        };
      case 'timeline':
      case 'history':
        return {
          action: 'navigate',
          payload: 'timeline',
          message: 'Navigating to Timeline'
        };
      case 'backup':
      case 'export':
        return {
          action: 'backup',
          message: 'Triggering database backup export...'
        };
      case 'restore':
      case 'import':
        return {
          action: 'restore',
          message: 'Opening restore file import...'
        };
      default:
        return null;
    }
  }
}
