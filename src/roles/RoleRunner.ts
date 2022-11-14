export interface RoleRunner {
  run(): void
}

/**
 * Exists to provide a no-op runner
 */
export class NoRunner implements RoleRunner {
  run() {
    // Don't run anything
  }
}
