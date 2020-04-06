import * as fs from 'fs';
import * as path from 'path';
import db from '../lib/db';

const ruleFile = path.join(process.cwd(), './src/test/rule.json');

let data = fs.readFileSync(ruleFile, 'utf8');
data = JSON.parse(data);

// tslint:disable
const instance = db.instance as any;
instance.set(db.TB_RULE, data).write();
