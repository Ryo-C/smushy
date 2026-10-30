import { MOCK_CONFIG } from '@/shared/constants/config';

export async function simulateNetworkDelay(): Promise<void> {
  if (!MOCK_CONFIG.enabled) {
    return; // No delay if mock is disabled
  }

  const { delayMin, delayMax } = MOCK_CONFIG;
  const delay = Math.random() * (delayMax - delayMin) + delayMin;

  if (MOCK_CONFIG.enableLogs) {
    console.log(`[Mock] Simulating network delay: ${Math.round(delay)}ms`);
  }

  return new Promise((resolve) => setTimeout(resolve, delay));
}
