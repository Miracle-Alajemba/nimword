export function paginate(items, page = 1, limit = 10) {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    page,
    totalPages: Math.ceil(items.length / limit),
  };
}
