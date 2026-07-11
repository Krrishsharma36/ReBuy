export type UserIntentType = 'command' | 'action' | 'capture' | 'search';

export interface DetectedIntent {
  intent: UserIntentType;
  commandName?: string;
  actionType?: 'history' | 'compare' | 'edit' | 'timeline';
  targetObjectName?: string;
  capturedText?: string;
}

const COMMANDS = ['backup', 'restore', 'settings', 'dark', 'light', 'about'];
const ACTIONS = ['history', 'compare', 'edit', 'timeline'] as const;

export class IntentDetector {
  /**
   * Evaluates the raw input string and detects the intended operation.
   */
  public static detect(inputText: string, knownObjects: string[] = []): DetectedIntent {
    const raw = inputText.trim();
    const lower = raw.toLowerCase();

    // 1. Detect Commands (exact match or prefix command)
    if (COMMANDS.includes(lower)) {
      return {
        intent: 'command',
        commandName: lower
      };
    }

    // 2. Detect Actions (e.g. "milk history" or "petrol compare")
    // Match: [Object Name] [Action Word]
    const tokens = raw.split(/\s+/).filter(Boolean);
    if (tokens.length >= 2) {
      const lastToken = tokens[tokens.length - 1].toLowerCase() as any;
      if (ACTIONS.includes(lastToken)) {
        const potentialObjectName = tokens.slice(0, -1).join(' ');
        
        // Match against known objects to ensure we don't treat random text ending with action words as actions
        const exactMatch = knownObjects.some(o => o.toLowerCase() === potentialObjectName.toLowerCase());
        
        if (exactMatch || knownObjects.length === 0) {
          return {
            intent: 'action',
            actionType: lastToken,
            targetObjectName: potentialObjectName,
            capturedText: raw
          };
        }
      }
    }

    // 3. Detect Capture (if string has numbers indicating amount or quantity, e.g. "milk 66")
    const hasPriceRegex = /\b\d+(?:\.\d{1,2})?\b/;
    if (hasPriceRegex.test(raw) && tokens.length >= 2) {
      // Ensure it's not a year or code (must be accompanied by other text tokens)
      const nonNumericTokens = tokens.filter(t => !/^\$?\d+(?:\.\d+)?\$?$/.test(t));
      if (nonNumericTokens.length > 0) {
        return {
          intent: 'capture',
          capturedText: raw
        };
      }
    }

    // 4. Default: Search
    return {
      intent: 'search',
      capturedText: raw
    };
  }
}
export { COMMANDS, ACTIONS };
