import * as dayjs from 'dayjs';
import db from '../../db';
import RuleHandler from './rule';
import ReplyHandler from './reply';
import { MessageHandlerOptions } from './message';

const handler: any = {
    get(name: string) {
        let mapping: any = {
            'add rule': 'addRule',
            'add-rule': 'addRule',
            'update rule': 'updateRule',
            'update-rule': 'updateRule',
            'remove rule': 'deleteRule',
            'remove-rule': 'deleteRule',
            'active rule': 'activeRule',
            'active-rule': 'activeRule',
            'pause rule': 'pauseRule',
            'pause-rule': 'pauseRule',
            'auto reply': 'autoReply',
            'auto-reply': 'autoReply',
            
        };
        console.log('[index.ts/18] handler.get(): ');
        
        return mapping[name] ? this[mapping[name]] : this[name];
    },

    autoReply(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            console.log('[index.ts/31] autoReply ');
            const result = await ReplyHandler.autoReply(data).catch(() => {
                reject();
            });
            resolve(result);
        });
    },

    addRule(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            let findRule: any = await RuleHandler.findRule(data.keywords);
            if (!findRule) {
                let result = await RuleHandler.addRule(data);
                resolve('添加成功');
                return;
            }
            reject();
        });
    },
    
    updateRule(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            let findRule: any = await RuleHandler.findRule(data.keywords);
            if (findRule) {
                await RuleHandler.updateRule(findRule.id, data);
                resolve('更新成功');
                return;
            }
            reject();
        });
    },

    pauseRule(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            console.log('[index.ts/57] pauseRule: ');
            let keywords = Array.isArray(data.keywords) ? data.keywords[0] : data.keywords;
            let result = await RuleHandler.pauseRule(keywords);
            resolve(result);
        });
    },

    activeRule(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            let keywords = Array.isArray(data.keywords) ? data.keywords[0] : data.keywords;
            let result = await RuleHandler.activeRule(keywords);
            resolve(result);
        });
    },

    deleteRule(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            let findRule: any = await RuleHandler.findRule(data.keywords);
            if (findRule) {
                RuleHandler.deleteRule(findRule.id);
                resolve('删除成功');
                return;
            }
            reject();
        });
    },

    addRelease(data: any) {
        data.type = 'release';
        return handler.addRecord(data);
    },

    addRecord(data: any) {
        return new Promise(async (resolve, reject) => {
            const instance = await db.instance;
            instance.get(db.TB_RECORD).push({
                type: data.type,
                createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                createBy: data.from,
                from: data.from,
                room: data.room,
                data,
                reply: data.reply
            }).write();
            resolve('添加成功');
        });
    },

    log(data: any) {
        return new Promise(async (resolve, reject) => {
            const instance = await db.instance;
            console.log('[index.ts/106] log ');
            
            instance.get(db.TB_LOG).push({
                type: 'text',
                createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                from: data.from,
                room: data.room,
                data: data.data
            }).write();
            resolve('日志添加成功');
        });
    }
};

export default handler;