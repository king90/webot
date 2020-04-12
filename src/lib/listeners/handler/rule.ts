import * as dayjs from 'dayjs';
import db from '../../db';
import { Message, Contact } from 'wechaty';
import { MessageHandlerOptions } from './message';
import Schedule from './schedule';

// const TABLE_RULE = db.TB_RULE;

import RuleDB from '../../db/rule';

export enum RuleEnableEnum {
    INIT = 0,
    ACTIVE,
    REMOVE,
    PAUSE,
    REACTIVE
}

function createHandler(data: MessageHandlerOptions) {
    if (data.handler) {
        return data.handler;
    }
    let handler;
    let replyData = data.reply;
    if (replyData && replyData.type === 'text') {
        handler = [{
            name: 'autoReply',
            data: replyData.data
        }];
    }
    return handler;
}

export default {
    addRule(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            const instance = await db.instance;
            let model = RuleDB.getInstance() as any;
            let size = model.size().value();

            let msg = data.msg;
            let contact: Contact | null = msg.from();

            let handler = createHandler(data);

            const result = model.push({
                id: `${size + 2}`,
                name: "",
                keyword: data.keyword,
                enable: data.enable,
                createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                from: contact ? contact.name() : undefined,
                enableSchedule: data.enableSchedule,
                scheduleTime: data.scheduleTime,
                allow: data.allow,
                ignore: data.ignore,
                handler: handler
            }).write();

            if (data.enableSchedule && data.scheduleTime) {
                Schedule.checkAndAdd(data.keyword, data.scheduleTime);
            }

            resolve(result);
        });
    },

    updateRule(id: string, data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            const result = RuleDB.getInstance()
                .find({ id })
                .assign({
                    name: "",
                    keyword: data.keyword,
                    enable: data.enable,
                    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    enableSchedule: data.enableSchedule,
                    scheduleTime: data.scheduleTime,
                    allow: data.allow,
                    ignore: data.ignore,
                    handler: createHandler(data)
                }).write();

            console.log('[rule.ts/84] update rule keyword: ', result);

            if (data.enableSchedule && data.scheduleTime) {
                Schedule.checkAndAdd(data.keyword, data.scheduleTime);
            } else {
                Schedule.remove(data.keyword);
            }

            resolve(result);
        });
    },

    /**
     * 删除rule
     */
    deleteRule(id: string) {
        return new Promise(async (resolve, reject) => {
            const result = RuleDB.getInstance()
                .find({ id })
                .assign({
                    enable: RuleEnableEnum.REMOVE,
                    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
                }).write().value();
            
            console.log('[rule.ts/107] deleteRule result: ', result);
            Schedule.remove(result.keyword);

            resolve();
        });
    },

    /**
     * 暂停 rule
     */
    pauseRule(keyword: string) {
        return new Promise(async (resolve, reject) => {
            RuleDB.getInstance()
                .find({ keyword: keyword })
                .assign({
                    enable: RuleEnableEnum.PAUSE,
                    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
                }).write();
            resolve();
        });
    },

    /**
     * 激活 rule
     */
    activeRule(keyword: string) {
        return new Promise(async (resolve, reject) => {
            RuleDB.getInstance()
                .find({ keyword })
                .assign({
                    enable: RuleEnableEnum.REACTIVE,
                    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
                }).write();

            resolve();
        });
    },

    findRule(keyword: string | Array<string>) {
        return new Promise(async (resolve, reject) => {
            console.log('[rule.ts/125] findRule: ', keyword);
            if (keyword === undefined) {
                reject('查询关键字不能为空');
                return;
            }
            const result = RuleDB.getInstance()
                .find({ keyword: keyword })
                .value();
            console.log('[rule.ts/130] findRule result: ', result);
            resolve(result);
        });
    }
};


