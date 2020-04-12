import * as fs from 'fs';
import * as path from 'path';
import RuleDB from '../lib/db/rule';

const ruleFile = path.join(process.cwd(), './src/test/rule.json');

let data: any = fs.readFileSync(ruleFile, 'utf8');
data = JSON.parse(data);

// tslint:disable
const instance = RuleDB.init(data);
