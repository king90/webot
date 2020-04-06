import * as low from 'lowdb';
import FileSync = require('lowdb/adapters/FileSync');
import * as path from 'path';

const STORE_FILE: string = path.join(process.cwd(), './.temp/db.json');

const adapter: low.AdapterSync = new FileSync(STORE_FILE);
const db: any = low(adapter);
export { db };
