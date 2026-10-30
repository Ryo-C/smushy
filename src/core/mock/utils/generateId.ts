export function generateMockId(prefix: string): string {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `${prefix}-${randomString}${timestamp}`;
}
