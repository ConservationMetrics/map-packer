import type { Pool } from "pg";

import type { MapRequest } from "@/types/types";

const checkTableExists = async (
  db: Pool,
  table: string | undefined,
): Promise<boolean> => {
  const query = `SELECT to_regclass('${table}')`;
  let result;
  try {
    result = await db.query<{ to_regclass: string | null }>(query);
  } catch (error) {
    throw new Error(
      `Failed to check if table exists: ${(error as Error).message}`,
    );
  }
  return result.rows[0].to_regclass !== null;
};

const createMapRequestTable = async (
  db: Pool,
  table: string | undefined,
): Promise<void> => {
  console.log(`Table ${table} does not exist. Creating...`);
  const query = `
    CREATE TABLE ${table} (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
      title TEXT,
      description TEXT,
      style TEXT,
      overlay TEXT,
      openstreetmap BOOLEAN,
      mapbox_style TEXT,
      planet_monthly_visual TEXT,
      bounds TEXT,
      min_zoom INT,
      max_zoom INT,
      ratio INT,
      tile_type TEXT,
      number_of_tiles INT,
      filename TEXT,
      file_location TEXT,
      file_size TEXT,
      format TEXT,
      thumbnail_filename TEXT,
      status TEXT,
      error_message TEXT,
      work_begun TIMESTAMP(6),
      work_ended TIMESTAMP(6)
    )
  `;
  try {
    await db.query(query);
    console.log(`Table ${table} created successfully`);
  } catch (error) {
    throw new Error(
      `Failed to create table ${table}: ${(error as Error).message}`,
    );
  }
};

const fetchDataFromTable = async (
  db: Pool,
  table: string | undefined,
  limit: number,
  cursor: number | null,
): Promise<MapRequest[]> => {
  let query: string;
  const values: (number | null)[] = [limit];

  if (cursor) {
    query = `SELECT * FROM ${table} WHERE id < $2 ORDER BY id DESC LIMIT $1`;
    values.push(cursor);
  } else {
    query = `SELECT * FROM ${table} ORDER BY id DESC LIMIT $1`;
  }

  let result;
  try {
    result = await db.query(query, values);
  } catch (error) {
    throw new Error(`Failed to fetch data from table ${table}: ${error}`);
  }
  if (!result || !result.rows) {
    throw new Error("No result returned from query.");
  }
  return result.rows;
};

export const fetchData = async (
  db: Pool,
  table: string | undefined,
  limit: number,
  cursor: number | null,
): Promise<{ data: MapRequest[] | null }> => {
  console.log(`Fetching data from ${table}...`);
  const databaseExists = await checkTableExists(db, table);
  if (!databaseExists) {
    await createMapRequestTable(db, table);
  }
  const data = await fetchDataFromTable(db, table, limit, cursor);
  return { data: data || null };
};

export const insertDataIntoTable = async (
  db: Pool,
  table: string | undefined,
  data: MapRequest,
): Promise<number> => {
  const databaseExists = await checkTableExists(db, table);
  if (!databaseExists) {
    await createMapRequestTable(db, table);
  }
  const columns = Object.keys(data).join(", ");
  const placeholders = Object.keys(data)
    .map((_, i) => `$${i + 1}`)
    .join(", ");
  const values = Object.values(data);
  // Return id so it can be used if needed for error handling
  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING id`;
  let result;
  try {
    result = await db.query(query, values);
  } catch (error) {
    throw new Error(
      `Failed to insert data into table ${table}: ${(error as Error).message}`,
    );
  }
  if (result.rows.length > 0) {
    return result.rows[0].id;
  } else {
    throw new Error("No rows returned after insert.");
  }
};

export const handleDeleteRequest = async (
  db: Pool,
  table: string | undefined,
  requestId: number | null,
): Promise<boolean> => {
  if (
    requestId === null ||
    requestId === undefined ||
    !Number.isInteger(requestId)
  ) {
    throw new Error("Invalid ID provided for delete request.");
  }

  const query = `SELECT file_location, filename FROM ${table} WHERE id = $1`;
  let result;
  try {
    result = await db.query(query, [requestId]);
  } catch (error) {
    throw new Error(
      `Failed to fetch file location and filename: ${(error as Error).message}`,
    );
  }
  const { file_location, filename } = result.rows[0];

  if (!file_location || !filename) {
    console.log("File location or filename is NULL. Deleting row...");
    const deleteQuery = `DELETE FROM ${table} WHERE id = $1`;
    try {
      await db.query(deleteQuery, [requestId]);
    } catch (error) {
      throw new Error(`Failed to delete row: ${error}`);
    }
    return false;
  } else {
    if (!table) {
      throw new Error("Table name must be provided.");
    }
    console.log("Updating data in database...");
    await updateDatabaseMapRequest(db, table, requestId, {
      status: "PENDING DELETION",
    });
    return true;
  }
};

export async function updateDatabaseMapRequest(
  db: Pool,
  tableName: string,
  id: number | null,
  data: Partial<MapRequest>,
) {
  if (id === null || id === undefined || !Number.isInteger(id)) {
    throw new Error("Invalid ID provided for updating database.");
  }

  const columns = Object.keys(data)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");
  const values = Object.values(data);
  values.push(id);

  const query = `
    UPDATE ${tableName}
    SET ${columns}
    WHERE id = $${values.length}
  `;

  try {
    await db.query(query, values);
  } catch (error) {
    throw new Error(
      `Error updating record ${id} in table ${tableName}: ${(error as Error).message}`,
    );
  }
  console.log(`Record ${id} in table ${tableName} updated.`);
}

export async function updateDatabaseWithError(
  db: Pool,
  tableName: string,
  id: number | null,
  errorMessage: string,
) {
  if (id === null || id === undefined || !Number.isInteger(id)) {
    throw new Error("Invalid ID provided for updating error message.");
  }

  const query = `
    UPDATE ${tableName}
    SET status = 'FAILED', error_message = $1
    WHERE id = $2
  `;
  try {
    await db.query(query, [errorMessage, id]);
  } catch (error) {
    throw new Error(
      `Error updating record ${id} in table ${tableName}: ${(error as Error).message}`,
    );
  }
  console.log(`Record ${id} in table ${tableName} updated with error message.`);
}
