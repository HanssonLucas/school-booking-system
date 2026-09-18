import type Database from "better-sqlite3";

// Run after the classes table has been created. Keep this module independent
// of db.ts to avoid a circular import during database initialization.
export const migrateClassDetails = (db: Database.Database): void => {
  const migrate = db.transaction(() => {
    const columns = db.prepare("PRAGMA table_info(classes)").all() as {
      name: string;
    }[];
    const hasColumn = (name: string) =>
      columns.some((column) => column.name === name);

    if (!hasColumn("designation")) {
      db.exec(`
        ALTER TABLE classes
        ADD COLUMN designation TEXT
          CHECK (
            designation IS NULL OR
            (length(trim(designation)) > 0 AND length(designation) <= 40)
          )
      `);
    }

    if (!hasColumn("description")) {
      db.exec(`
        ALTER TABLE classes
        ADD COLUMN description TEXT
          CHECK (
            description IS NULL OR
            (length(trim(description)) > 0 AND length(description) <= 500)
          )
      `);
    }
  });

  // Read column information inside the write transaction so concurrent
  // initialization cannot add the same column twice.
  migrate.immediate();
};
