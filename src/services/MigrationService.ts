import { MetadataRepository } from '../database/repositories/MetadataRepository';
import { ReBuyDBError } from '../types';

export type MigrationHandler = () => Promise<void>;

export class MigrationService {
  private metaRepo = new MetadataRepository();
  private migrations = new Map<number, MigrationHandler>();

  constructor() {
    this.registerMigrationPipeline();
  }

  /**
   * Registers schema update handlers.
   */
  private registerMigrationPipeline() {
    // Migration from v1 to v2 placeholder
    this.migrations.set(2, async () => {
      console.log('[MigrationService] Running migration to DB Version 2...');
      // Implement upgrade steps, e.g. adding new keys or indices
    });
  }

  /**
   * Validates database metadata version tracking against the target running version
   * and sequentially runs migrations.
   */
  public async runMigrations(currentRunningVersion: number): Promise<void> {
    const databaseMigrationVersion = await this.metaRepo.get<number>('migration_version', 1);

    if (databaseMigrationVersion >= currentRunningVersion) {
      console.log('[MigrationService] Database version matches current migration targets.');
      return;
    }

    console.log(`[MigrationService] Starting migrations from v${databaseMigrationVersion} to v${currentRunningVersion}`);

    for (let targetVersion = databaseMigrationVersion + 1; targetVersion <= currentRunningVersion; targetVersion++) {
      const handler = this.migrations.get(targetVersion);
      if (handler) {
        try {
          await handler();
          await this.metaRepo.set('migration_version', targetVersion);
          console.log(`[MigrationService] Successfully migrated database schema to version ${targetVersion}`);
        } catch (error) {
          throw new ReBuyDBError(
            `Migration to version ${targetVersion} failed. Upgrade pipeline halted.`,
            'DATABASE_MIGRATION_FAILED',
            error
          );
        }
      }
    }
  }
}
