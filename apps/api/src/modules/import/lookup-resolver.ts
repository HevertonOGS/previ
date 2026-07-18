interface NameLookupRecord {
  id: string;
  name: string;
}

interface NameLookupDelegate<T extends NameLookupRecord> {
  findMany(args: { where: { name: { in: string[] } } }): Promise<T[]>;
  createMany(args: {
    data: ({ name: string } & Record<string, unknown>)[];
    skipDuplicates: boolean;
  }): Promise<{ count: number }>;
}

export async function resolveByName<T extends NameLookupRecord>(
  delegate: NameLookupDelegate<T>,
  rawNames: (string | null | undefined)[],
  buildCreateData: (name: string) => { name: string } & Record<string, unknown> = (name) => ({ name }),
): Promise<Map<string, T>> {
  const trimmedNames = rawNames.filter((n): n is string => !!n?.trim()).map((n) => n.trim());
  const result = new Map<string, T>();
  if (trimmedNames.length === 0) return result;

  // Dedupe case-insensitively so "Lazer" and "lazer" resolve to a single record
  // instead of creating two near-duplicate rows; every original casing still
  // ends up in the returned map so per-row lookups always hit.
  const canonicalByLower = new Map<string, string>();
  for (const n of trimmedNames) {
    const lower = n.toLowerCase();
    if (!canonicalByLower.has(lower)) canonicalByLower.set(lower, n);
  }

  const existing = await delegate.findMany({ where: { name: { in: [...canonicalByLower.values()] } } });
  const recordByLower = new Map(existing.map((e) => [e.name.toLowerCase(), e]));

  const missingLower = [...canonicalByLower.keys()].filter((lower) => !recordByLower.has(lower));
  if (missingLower.length > 0) {
    const missingNames = missingLower.map((lower) => canonicalByLower.get(lower) as string);
    await delegate.createMany({ data: missingNames.map(buildCreateData), skipDuplicates: true });
    const created = await delegate.findMany({ where: { name: { in: missingNames } } });
    for (const c of created) recordByLower.set(c.name.toLowerCase(), c);
  }

  for (const n of trimmedNames) {
    const rec = recordByLower.get(n.toLowerCase());
    if (rec) result.set(n, rec);
  }

  return result;
}
