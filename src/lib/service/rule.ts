import * as dayjs from 'dayjs';
import { Contact } from 'wechaty';
import { MessageHandlerOptions } from './message';
import Schedule from './schedule';

import RuleDB, { RULE_TABLE } from '../db/rule';

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
    /**
     * 
     * @param data 
     * 
     * 添加规则命令示例格式:
     * addRule
     * 关键字：查询拆红包问题进度
     * 是否定时：是，否
     * 定时时间：1h
     * 允许群：
     * 允许人：
     * 定时回复人：
     * 定时回复群：
     * handler: 
     * 回复：
     * 1，端外首次助力用户抽奖跳转抓娃娃后，登录收银台提示错误
     * 2，端外通过客户端跳转拆红包，拆红包页面不出来或被覆盖；
     * 3，助力链接每次都要登录，添加缓存；
     * 4，拆红包所有的数据库操作，review确认
     */
    addRule(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
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
                schedule: {
                    enable: data.schedule?.enable,
                    time: data.schedule?.time,
                    replyTo: data.schedule?.replyTo
                },
                allow: data.allow,
                ignore: data.ignore,
                handler: handler
            }).write();

            if (data.schedule && data.schedule.enable && data.schedule.time) {
                new Schedule().checkAndAdd(data.keyword, data.schedule.time);
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
                    schedule: {
                        enable: data.schedule?.enable,
                        time: data.schedule?.time,
                        replyTo: data.schedule?.replyTo
                    },
                    allow: data.allow,
                    ignore: data.ignore,
                    handler: createHandler(data)
                }).write();

            console.log('[rule.ts/84] update rule keyword: ', result);

            if (data.schedule && data.schedule.enable && data.schedule.time) {
                new Schedule().checkAndAdd(data.keyword, data.schedule.time);
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
            const result = RuleDB.getInstance().find({ id });
            RuleDB.getInstance().remove({ id }).write();

            result.enable = RuleEnableEnum.REMOVE;
            result.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

            RuleDB.getInstance(RULE_TABLE.HISTORY).push(result).write();

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

    findRule(keyword: string) {
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


