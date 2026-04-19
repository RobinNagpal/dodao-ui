-- Seeds one canary row into every user table in the public schema.
--
-- Used only by the "check new migrations don't break populated DB" CI step:
-- after applying main's baseline migrations, we run this file so that the
-- subsequent `prisma migrate deploy` of the PR's new migrations runs
-- against a DB that has rows — if a new migration adds a NOT NULL column
-- without a default, tightens a CHECK constraint, or otherwise requires
-- data destruction, PostgreSQL will reject the ALTER and the step fails.
--
-- This is best-effort: tables whose required columns are foreign keys or
-- otherwise can't be filled with dummy values are logged and skipped so
-- the overall seed step still succeeds for the tables it CAN seed.

DO $$
DECLARE
  t record;
  col record;
  col_list text;
  val_list text;
  insert_sql text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '\_prisma\_%' ESCAPE '\'
  LOOP
    col_list := '';
    val_list := '';

    FOR col IN
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = t.table_name
        AND is_nullable = 'NO'
        AND column_default IS NULL
      ORDER BY ordinal_position
    LOOP
      IF col_list <> '' THEN
        col_list := col_list || ', ';
        val_list := val_list || ', ';
      END IF;

      col_list := col_list || quote_ident(col.column_name);
      val_list := val_list || CASE col.data_type
        WHEN 'integer'                     THEN '0'
        WHEN 'bigint'                      THEN '0'
        WHEN 'smallint'                    THEN '0'
        WHEN 'numeric'                     THEN '0'
        WHEN 'double precision'            THEN '0'
        WHEN 'real'                        THEN '0'
        WHEN 'boolean'                     THEN 'FALSE'
        WHEN 'timestamp without time zone' THEN 'NOW()'
        WHEN 'timestamp with time zone'    THEN 'NOW()'
        WHEN 'date'                        THEN 'CURRENT_DATE'
        WHEN 'uuid'                        THEN '''00000000-0000-0000-0000-000000000001''::uuid'
        WHEN 'jsonb'                       THEN '''{}''::jsonb'
        WHEN 'json'                        THEN '''{}''::json'
        -- udt_name for array columns is prefixed with '_' (e.g. '_text' → text[])
        WHEN 'ARRAY'                       THEN '''{}''::' || substring(col.udt_name from 2) || '[]'
        ELSE                                    '''ci-seed-' || replace(col.column_name, '''', '''''') || ''''
      END;
    END LOOP;

    IF col_list <> '' THEN
      insert_sql := format('INSERT INTO %I (%s) VALUES (%s) ON CONFLICT DO NOTHING', t.table_name, col_list, val_list);
    ELSE
      insert_sql := format('INSERT INTO %I DEFAULT VALUES ON CONFLICT DO NOTHING', t.table_name);
    END IF;

    BEGIN
      EXECUTE insert_sql;
      RAISE NOTICE 'seeded %', t.table_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'skipped % (%)', t.table_name, SQLERRM;
    END;
  END LOOP;
END $$;
