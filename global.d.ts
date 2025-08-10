declare global {
  interface ScreenOrientation {
    lock(orientation: 'portrait' | 'landscape' | 'landscape-primary' | 'landscape-secondary' | 'portrait-primary' | 'portrait-secondary'): Promise<void>;
    unlock(): void;
  }
}
export {};
