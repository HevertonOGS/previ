import { resolveByName } from './lookup-resolver';

describe('resolveByName', () => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function mockDelegate(existing: { id: string; name: string }[]) {
    const created: { id: string; name: string }[] = [];
    return {
      created,
      findMany: jest.fn(async ({ where: { name: { in: names } } }: { where: { name: { in: string[] } } }) => {
        const pool = [...existing, ...created];
        return pool.filter((e) => names.some((n) => n.toLowerCase() === e.name.toLowerCase()));
      }),
      createMany: jest.fn(async ({ data }: { data: { name: string }[] }) => {
        for (const d of data) created.push({ id: `new-${d.name}`, name: d.name });
        return { count: data.length };
      }),
    };
  }

  it('should resolve names that already exist without creating anything', async () => {
    const delegate = mockDelegate([{ id: 'et-1', name: 'Alimentação' }]);

    const result = await resolveByName(delegate, ['Alimentação']);

    expect(result.get('Alimentação')?.id).toBe('et-1');
    expect(delegate.createMany).not.toHaveBeenCalled();
  });

  it('should match existing names case-insensitively', async () => {
    const delegate = mockDelegate([{ id: 'et-1', name: 'Alimentação' }]);

    const result = await resolveByName(delegate, ['alimentação']);

    expect(result.get('alimentação')?.id).toBe('et-1');
    expect(delegate.createMany).not.toHaveBeenCalled();
  });

  it('should auto-create names that do not exist yet', async () => {
    const delegate = mockDelegate([]);

    const result = await resolveByName(delegate, ['Lazer']);

    expect(delegate.createMany).toHaveBeenCalledWith({ data: [{ name: 'Lazer' }], skipDuplicates: true });
    expect(result.get('Lazer')?.id).toBe('new-Lazer');
  });

  it('should deduplicate repeated raw names before resolving', async () => {
    const delegate = mockDelegate([]);

    await resolveByName(delegate, ['Lazer', 'Lazer', 'lazer']);

    expect(delegate.createMany).toHaveBeenCalledTimes(1);
    expect((delegate.createMany.mock.calls[0][0] as { data: { name: string }[] }).data).toHaveLength(1);
  });

  it('should ignore null/blank raw names', async () => {
    const delegate = mockDelegate([]);

    const result = await resolveByName(delegate, [null, '', '  ', undefined]);

    expect(result.size).toBe(0);
    expect(delegate.findMany).not.toHaveBeenCalled();
  });

  it('should use a custom create-data builder when provided', async () => {
    const delegate = mockDelegate([]);

    await resolveByName(delegate, ['Casa'], (name) => ({ name, kind: 'EXPENSE' }));

    expect(delegate.createMany).toHaveBeenCalledWith({
      data: [{ name: 'Casa', kind: 'EXPENSE' }],
      skipDuplicates: true,
    });
  });
});
