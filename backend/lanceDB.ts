// import * as lancedb from "@lancedb/lancedb";
// import * as arrow from "apache-arrow";
// const databaseDir = "./lancedb";
// const db = await lancedb.connect(databaseDir);

// // list tables in database
// const tableNames = await db.tableNames();
// console.log("Tables: ", tableNames);

// // create table
// const _tbl = await db.createTable(
//   "myTable",
//   [
//     { vector: [3.1, 4.1], item: "foo", price: 10.0 },
//     { vector: [5.9, 26.5], item: "bar", price: 20.0 },
//   ],
//   { mode: "overwrite" },
// );

// // add data
// _tbl.add([
//   { vector: [3.1, 4.1], item: "foo", price: 10.0 },
//   { vector: [5.9, 26.5], item: "bar", price: 20.0 },
// ])

// // open table
// const tbl = await db.openTable("myTable");

// // search
// const res = (await _tbl.search([1,1]).toArray());
// console.log("res: ", res);

// // drop table
// await db.dropTable("myTable");

// const tableName = await db.tableNames();
// console.log("Tables: ", tableName);

import { connect, Table } from "@lancedb/lancedb"; // or 'lancedb' if that's your package
import { embedText } from "./src/handlers/embed.js";
type PageRecord = {
  vector: number[];
  pageContents: string;
  url: string;
};

const db = await connect("./lancedb");

const tableName = "myTable";
let tbl: Table;

const tableNames = await db.tableNames();
if (tableNames.includes(tableName)) {
  tbl = await db.openTable(tableName);
} else {
  tbl = await db.createTable(
    tableName,
    [
      {
        vector: Array(3072).fill(0),
        pageContents: "",
        url: "",
      },
    ],
    { mode: "overwrite" }
  );
}

// Now you can safely add records
const chunk = "some chunked text";
const vector = await embedText(chunk); // ensure it returns number[]
console.log("vector: ", vector.slice(0, 5));
await tbl.add([
  {
    vector: vector as number[],
    pageContents: chunk,
    url: "https://example.com",
  },
]);
