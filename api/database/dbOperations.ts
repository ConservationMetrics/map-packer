const checkTableExists = (
  db: any,
  table: string | undefined,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    let query: string;
    query = `SELECT to_regclass('${table}')`;
    db.query(query, (err: Error, result: { rows: any[] }) => {
      if (err) reject(err);
      resolve(result.rows[0].to_regclass !== null);
    });
  });
};

const createMapRequestTable = async (db: any, table: string | undefined): Promise<void> => {
  console.log(`Table ${table} does not exist. Creating...`);
  const query = `
    CREATE TABLE ${table} (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
      title TEXT,
      description TEXT,
      style TEXT,
      overlay TEXT,
      apikey TEXT,
      openstreetmap BOOLEAN,
      mapboxstyle TEXT,
      planet_monthly_visual TEXT,
      bounds TEXT,
      minzoom INT,
      maxzoom INT,
      ratio INT,
      tiletype TEXT,
      numberoftiles INT,
      filename TEXT,
      filelocation TEXT,
      filesize TEXT,
      status TEXT,
      errormessage TEXT,
      workbegun TIMESTAMP(6),
      workended TIMESTAMP(6)
    )
  `;  
  return new Promise((resolve, reject) => {
    db.query(query, (err: Error) => {
      if (err) reject(err);
      console.log(`Table ${table} created successfully`);
      resolve();
    });
  });
}

const fetchDataFromTable = async (
  db: any,
  table: string | undefined,
): Promise<any[]> => {
  let query: string;
  query = `SELECT * FROM ${table}`;
  return new Promise((resolve, reject) => {
    db.query(query, (err: Error, result: { rows: any[] }) => {
      if (err) reject(err);
      resolve(result.rows);
    });
  });
};

export const fetchData = async (
  db: any,
  table: string | undefined,
): Promise<{ data: any[] | null }> => {
  console.log(`Fetching data from ${table}...`);
  const databaseExists = await checkTableExists(db, table);
  if (!databaseExists) {
    await createMapRequestTable(db, table);
  }
  let data = await fetchDataFromTable(db, table);;

  return { data };
};

export const insertDataIntoTable = async (
  db: any,
  table: string | undefined,
  data: any
): Promise<void> => {
  const databaseExists = await checkTableExists(db, table);
  if (!databaseExists) {
    await createMapRequestTable(db, table);
  }
  const columns = Object.keys(data).join(", ");
  const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(", ");
  const values = Object.values(data);
  // Return id so it can be used if needed for error handling
  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING id`;
  return new Promise((resolve, reject) => {
    db.query(query, values, (err: Error, result: { rows: any[] }) => {
      if (err) reject(err);
      if (result.rows.length > 0) {
        resolve(result.rows[0].id);
      } else {
        reject(new Error('No rows returned after insert.'));
      }
    });
  });
};

export async function updateDatabaseWithError(db: any, tableName: string, id: number | void | null, errorMessage: string) {
  if (id === null || id === undefined || !Number.isInteger(id)) {
    throw new Error('Invalid ID provided for updating error message.');
  }

  const query = `
    UPDATE ${tableName}
    SET status = 'FAILED', errormessage = $1
    WHERE id = $2
  `;

  return new Promise<void>((resolve, reject) => {
    db.query(query, [errorMessage, id], (err: Error) => {
      if (err) {
        console.error(`Error updating record ${id} in table ${tableName}: ${err.message}`);
        reject(err);
      } else {
        console.log(`Record ${id} in table ${tableName} updated with error message.`);
        resolve();
      }
    });
  });
}