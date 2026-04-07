type QueryableDb = Pick<D1Database, 'prepare'>;

type AuthSubjectColumn = 'auth_subject' | 'clerk_id';
const USER_LOOKUP_TABLES = ['users', 'user_account', 'user'] as const;

export interface UserLookupConfig {
  tableName: (typeof USER_LOOKUP_TABLES)[number];
  subjectColumn: AuthSubjectColumn;
}

async function getTableColumns(db: QueryableDb, tableName: string): Promise<Set<string>> {
  const res = await db.prepare(`PRAGMA table_info("${tableName}")`).all();
  return new Set(
    ((res.results ?? []) as Array<{ name?: unknown }>).flatMap((row) =>
      typeof row.name === 'string' ? [row.name] : []
    )
  );
}

export async function resolveAuthSubjectColumn(
  db: QueryableDb,
  tableName: string
): Promise<AuthSubjectColumn> {
  const columns = await getTableColumns(db, tableName);

  if (columns.has('auth_subject')) {
    return 'auth_subject';
  }
  if (columns.has('clerk_id')) {
    return 'clerk_id';
  }

  throw new Error(`No auth subject column was found on table "${tableName}".`);
}

export async function resolveUserLookup(db: QueryableDb): Promise<UserLookupConfig> {
  for (const tableName of USER_LOOKUP_TABLES) {
    const columns = await getTableColumns(db, tableName);
    if (columns.size === 0) {
      continue;
    }

    if (columns.has('auth_subject')) {
      return { tableName, subjectColumn: 'auth_subject' };
    }
    if (columns.has('clerk_id')) {
      return { tableName, subjectColumn: 'clerk_id' };
    }
  }

  throw new Error('No user identity table with an auth subject column is available.');
}
