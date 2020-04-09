import * as dayjs from 'dayjs';
import db from '../../db';
import { Message, Contact } from 'wechaty';
import { MessageHandlerOptions } from './message';

const TABLE_RULE = db.TB_RULE;

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
            let model = instance.get(TABLE_RULE) as any;
            let size = model.size().value();

            let msg = data.msg;
            let contact: Contact | null = msg.from();

            let handler = createHandler(data);

            model.push({
                id: `${size + 2}`,
                name: "",
                keywords: data.keywords,
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

            resolve();
        });
    },

    updateRule(id: string, data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            const instance = await db.instance;
            instance.get(TABLE_RULE)
                .find({ id })
                .assign({
                    name: "",
                    keywords: data.keywords,
                    enable: data.enable,
                    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    enableSchedule: data.enableSchedule,
                    scheduleTime: data.scheduleTime,
                    allow: data.allow,
                    ignore: data.ignore,
                    handler: createHandler(data)
                }).write();
            resolve();
        });
    },

    deleteRule(id: string) {
        return new Promise(async (resolve, reject) => {
            const instance = await db.instance;
            instance.get(TABLE_RULE)
                .find({ id })
                .assign({
                    enable: RuleEnableEnum.REMOVE,
                    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
                }).write();
            resolve();
        });
    },

    pauseRule(keywords: string) {
        return new Promise(async (resolve, reject) => {
            const instance = await db.instance;
            console.log('[rule.ts/98] pauseRule find value: ', instance.get(TABLE_RULE).find({ keywords }).value());
            instance.get(TABLE_RULE)
                .find({ keywords: keywords })
                .assign({
                    enable: RuleEnableEnum.PAUSE,
                    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
                }).write();
            resolve();
        });
    },

    activeRule(keywords: string) {
        return new Promise(async (resolve, reject) => {
            const instance = await db.instance;
            console.log('[rule.ts/112] activeRule find value: ', instance.get(TABLE_RULE).find({ keywords }).value());
            instance.get(TABLE_RULE)
                .find({ keywords })
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
            const instance = await db.instance;
            const result = instance.get(TABLE_RULE)
                .find({ keywords: keyword })
                .value();
            console.log('[rule.ts/130] findRule result: ', result);
            resolve(result);
        });
    }
};


