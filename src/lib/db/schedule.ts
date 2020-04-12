import * as low from 'lowdb';
import FileSync = require('lowdb/adapters/FileSync');
import * as path from 'path';

const TB_NAME = 'schedule';

const STORE_FILE: string = path.join(process.cwd(), './.temp/' + TB_NAME + '.json');

const adapter: low.AdapterSync = new FileSync(STORE_FILE);
const db: any = low(adapter);

const tables: any = [TB_NAME];
for (let i = 0; i < tables.length; i++) {
    // console.log(tables[i]);
    if (!db.has(tables[i]).value()) {
        db.set(tables[i], []).write();
    }
}

export default {
    init(data: Array<any>) {
        db.set(TB_NAME, data).write();
    },

    getInstance() {
        return db.get(TB_NAME);
    }
};
