import { useEffect } from 'react';

type KeyCombo = string; // e.g. "Control+k", "Escape", "/"

interface ShortcutOptions {
  preventDefault?: boolean;
  disableOnInput?: boolean;
}

/**
 * Custom hook to register global keyboard bindings.
 * Automatically handles cleanup on component unmounts.
 */
export function useKeyboardShortcuts(
  shortcuts: Record<KeyCombo, (e: KeyboardEvent) => void>,
  options: ShortcutOptions = { preventDefault: true, disableOnInput: true }
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore key events if the user is typing inside text inputs, textareas, etc.
      if (options.disableOnInput) {
        const activeElement = document.activeElement;
        const isInput =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          activeElement?.getAttribute('contenteditable') === 'true';

        if (isInput) {
          // Allow Escape to unfocus inputs
          if (event.key !== 'Escape') {
            return;
          }
        }
      }

      // Format combo key
      let combo = '';
      if (event.metaKey || event.ctrlKey) {
        combo += 'mod+';
      }
      combo += event.key.toLowerCase();

      // Look up standard single key or combo key
      const handler = shortcuts[combo] || shortcuts[event.key];

      if (handler) {
        if (options.preventDefault) {
          event.preventDefault();
        }
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, options]);
}
