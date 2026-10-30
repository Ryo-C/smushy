import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Only one accessibility check and listener for the entire app */
let cachedValue: boolean | null = null;
const listeners = new Set<(value: boolean) => void>();
let listenerRegistered = false;

function initializeListener(): void {
  if (listenerRegistered) return;
  listenerRegistered = true;

  AccessibilityInfo.isReduceMotionEnabled().then((value) => {
    cachedValue = value;
    listeners.forEach((listener) => listener(value));
  });

  AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
    cachedValue = value;
    listeners.forEach((listener) => listener(value));
  });
}

export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(cachedValue ?? false);

  useEffect(() => {
    initializeListener();

    if (cachedValue !== null && cachedValue !== reduceMotion) {
      setReduceMotion(cachedValue);
    }

    listeners.add(setReduceMotion);

    return () => {
      listeners.delete(setReduceMotion);
    };
  }, []);

  return reduceMotion;
}
