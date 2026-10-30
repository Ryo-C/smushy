export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  total: number;
}

export function paginateArray<T>(
  array: T[],
  offset: number = 0,
  limit: number = 20
): PaginatedResult<T> {
  const total = array.length;
  const items = array.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  return {
    items,
    hasMore,
    total,
  };
}
