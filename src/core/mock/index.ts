export {
  getMockData,
  setMockData,
  addToCollection,
  updateInCollection,
  removeFromCollection,
  findInCollection,
  clearAllMockData,
} from './storage/mockStorage';

export { initializeAllSeedData, resetToSeeds } from './storage/seedData';

export { simulateNetworkDelay } from './utils/delay';
export { generateMockId } from './utils/generateId';
export { paginateArray, type PaginatedResult } from './utils/pagination';
