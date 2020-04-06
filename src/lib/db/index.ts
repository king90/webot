import { db } from './connect';

const tables: any = ['rule', 'message', 'record', 'log', 'user', 'group'];
for (let i = 0; i < tables.length; i++) {
    // console.log(tables[i]);
    console.log(db.has(tables[i]).value());
    if (!db.has(tables[i]).value()) {
        
        db.set(tables[i], []).write();
    }
}
export default {
    instance: db,
    TB_RULE: 'rule',
    TB_MESSAGE: 'message',
    TB_RECORD: 'record',
    TB_LOG: 'log',
    TB_USER: 'user',
    TB_GROUP: 'group'
};
