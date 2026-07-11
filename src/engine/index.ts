import { InputAnalyzer, AnalyzedInput } from './InputAnalyzer';
import { IntentDetector, DetectedIntent, UserIntentType } from './IntentDetector';
import { ObjectMatcher } from './ObjectMatcher';
import { SmartDefaults } from './SmartDefaults';
import { LearningEngine } from './LearningEngine';
import { DuplicateDetector } from './DuplicateDetector';
import { CommandRouter, CommandExecutionResult } from './CommandRouter';
import { CaptureEngine, CapturePreview } from './CaptureEngine';
import { ObjectRepository } from '../database/repositories/ObjectRepository';

export class MemoryEngine {
  private static captureEngine = new CaptureEngine();
  private static objectRepo = new ObjectRepository();

  /**
   * Main entry point to process a single line typed in the Command Bar.
   * Runs in <10ms.
   */
  public static async processInput(inputText: string): Promise<{
    intent: DetectedIntent;
    analysis?: AnalyzedInput;
    preview?: CapturePreview;
    commandResult?: CommandExecutionResult | null;
  }> {
    const raw = inputText.trim();
    if (!raw) {
      return {
        intent: { intent: 'search' }
      };
    }

    // Fetch known objects for token disambiguation
    const allObjects = await this.objectRepo.getAll(true);
    const objectNames = allObjects.map(o => o.name);

    // 1. Detect user intent
    const intent = IntentDetector.detect(raw, objectNames);

    // 2. Route commands immediately if detected
    if (intent.intent === 'command' && intent.commandName) {
      const commandResult = CommandRouter.route(intent.commandName);
      return {
        intent,
        commandResult
      };
    }

    // 3. For capture/action/search, analyze and build previews
    const preview = await this.captureEngine.prepare(raw);

    return {
      intent,
      analysis: preview.analyzed,
      preview
    };
  }

  /**
   * Commits a previewed quick capture to the database.
   */
  public static async commitCapture(preview: CapturePreview) {
    return this.captureEngine.commit(preview.analyzed, preview.matchedObject);
  }
}

export * from './InputAnalyzer';
export * from './IntentDetector';
export * from './ObjectMatcher';
export * from './SmartDefaults';
export * from './LearningEngine';
export * from './DuplicateDetector';
export * from './CommandRouter';
export * from './CaptureEngine';
