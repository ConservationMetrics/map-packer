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
  console.log("Fetching data from", table, "...");
  // Fetch data
  const dataExists = await checkTableExists(db, table);
  let data = null;
  if (dataExists) {
    data = await fetchDataFromTable(db, table);
  } else {
    throw new Error("Table does not exist");
  }

  return { data };
};

export const insertDataIntoTable = async (
  db: any,
  table: string | undefined,
  data: any
): Promise<void> => {
  const columns = Object.keys(data).join(", ");
  const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(", ");
  const values = Object.values(data);
  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  return new Promise((resolve, reject) => {
    db.query(query, values, (err: Error) => {
      if (err) reject(err);
      resolve();
    });
  });
};
