const checkTableExists = (db: any, table: string | undefined): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    let query: string;
    query = `SELECT to_regclass('${table}')`;
    db.query(query, (err: Error, result: { rows: any[] }) => {
      if (err) reject(err);
      resolve(result.rows[0].to_regclass !== null);
    });
  });
};

const fetchDataFromTable = async (db: any, table: string | undefined): Promise<any[]> => {
  let query: string;
  query = `SELECT * FROM ${table}`;
  return new Promise((resolve, reject) => {
    db.query(query, (err: Error, result: { rows: any[] }) => {
      if (err) reject(err);
      resolve(result.rows);
    });
  });
};

const fetchData = async (db: any, table: string | undefined): Promise<{ data: any[] | null }> => {
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

export default fetchData;
