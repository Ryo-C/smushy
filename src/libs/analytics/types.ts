export interface Analytics {
  track(event: string, properties?: Record<string, any>): void;

  identify(userId: string, traits?: Record<string, any>): void;

  screen(name: string, properties?: Record<string, any>): void;
}
