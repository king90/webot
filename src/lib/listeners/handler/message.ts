import * as dayjs from 'dayjs';
import db from '../../db';
import { Message, Contact } from 'wechaty';

const TABLE_RULE = db.TB_RULE;

enum RuleEnableEnum {
    INIT = 0,
    ACTIVE,
    REMOVE,
    PAUSE,
    REACTIVE
}
/**
 * 定时设计
* * * * * *
┬ ┬ ┬ ┬ ┬ ┬
│ │ │ │ │ |
│ │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
│ │ │ │ └───── month (1 - 12)
│ │ │ └────────── day of month (1 - 31)
│ │ └─────────────── hour (0 - 23)
│ └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)

每分钟的第30秒触发： '30 * * * * *'
每小时的1分30秒触发 ：'30 1 * * * *'
每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'
每月的1日1点1分30秒触发 ：'30 1 1 1 * *'
2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'
每周1的1点1分30秒触发 ：'30 1 1 * * 1'
*/
export enum MessageHandlerReplyEnum {
    TEXT = 'text'
}
export interface MessageHandlerOptions {
    ruleName?: string,
    keywords: string | Array<string>,
    enable?: number,
    enableSchedule?: boolean,
    scheduleTime?: string,
    allow?: {
        group?: Array<string>,
        person?: Array<string>
    },
    ignore?: {
        group?: Array<string>,
        person?: Array<string>
    },
    handler?: Array<{name: string, data?: any}> | string,
    reply?: {
        type: MessageHandlerReplyEnum,
        data: string | Array<string> | undefined
    },
    msg: Message
}

const trim = (txt: any) => {
    if (txt === undefined) {
        return undefined;
    }
    return `${txt}`.replace(/^\s+/g, '').replace(/\s+$/g, '');
};

const isMultiLineMsg = (text: string) => {
    return /.+<br\/>.*/.test(text);
};
const parseMultiLineMsg = (text: string, msg: Message): MessageHandlerOptions | undefined => {
    
    let textList = text.split('<br/>');
    if (textList.length < 1) {
        return undefined;
    }

    let allowPerson = msg.from()?.name();

    let result: MessageHandlerOptions = {
        keywords: '',
        enableSchedule: false,
        enable: RuleEnableEnum.ACTIVE,
        allow: {
            person: allowPerson ? [allowPerson] : []
        },
        msg: msg
    };

    result.ruleName = trim(textList[0]);
    if (!result.ruleName) {
        return undefined;
    }

    let type = '';
    for (let i = 1; i < textList.length; i++) {
        let item = textList[i];
        let itemList = [];
        if (!/^\s+/.test(item)) {
            itemList = item.split(/[:：]/);
            let matchKey = itemList[0];
            let matchVal = trim(itemList[1]);
            console.log('[message.ts/100] matchKey: ', matchKey);
            console.log('[message.ts/100] matchKey=== handler: ', matchKey === 'handler');
            if (['关键字', 'keyword'].includes(matchKey)) {
                result.keywords = matchVal === undefined ? '' : matchVal;
            } else if (matchKey === '是否定时') {
                result.enableSchedule = matchVal === '是' ? true : false;
            } else if (matchKey === '定时时间') {
                result.scheduleTime = matchVal;
            } else if (matchKey === '允许群') {
                result.allow = result.allow || {};
                result.allow.group = matchVal ? matchVal.split(/[,，]/) : undefined;
            } else if (matchKey === '允许人') {
                result.allow = result.allow || {};
                if (matchVal) {
                    result.allow.person?.concat(matchVal.split(/[,，]/));
                }
            } else if (['handler', '处理'].includes(matchKey)) {
                console.log('[message.ts/115] matchVal: ', matchVal);
                if (matchVal) {
                    result.handler = [{ name: `${matchVal}` }];
                }
            } else if (matchKey === '回复') {
                type = 'reply';
                result.reply = {
                    type: MessageHandlerReplyEnum.TEXT,
                    data: textList.slice(i + 1).join('<br/>')
                };
            }
            continue;
        } else {
            console.log('[message.ts/130] item: ', item);
        }
    }
    return !result.keywords ? undefined : result;
};

const parseSingleLineMsg = (text: string, msg: Message): MessageHandlerOptions | undefined => {
    let textList = text.split(/\s+/);
    let result: MessageHandlerOptions = { keywords: '', msg: msg };

    if (textList.length > 0) {
        result.ruleName = textList[0] === '-' ? undefined : textList[0];
        result.keywords = textList[1];
    }

    return !result.keywords && !result.ruleName ? undefined : result;
};

export default {
    parse(msg: Message): MessageHandlerOptions | undefined {

        let isText = msg.type() === Message.Type.Text;
        if (!isText) {
            return undefined;
        }

        let text = msg.text().trim();
        if (!text) {
            return undefined;
        }
        
        let result;
        if (isMultiLineMsg(text)) {
            result = parseMultiLineMsg(text, msg);
        } else {
            result = parseSingleLineMsg(text, msg);
        }
        return result;
    }
};
