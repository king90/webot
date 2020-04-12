import db from '../db';
import { Message, Contact } from 'wechaty';
import Schedule from './schedule';

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
    keyword: string,
    enable?: number,
    schedule?: {
        name?: string,
        enable?: boolean,
        time?: string,
        replyTo?: {
            group?: Array<string>,
            person?: Array<string>
        }
    },
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
    mentionSelf: boolean,
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

/**
 * 解析多行数据
 * @param text string
 * @param msg Message
 */
const parseMultiLineMsg = (text: string, msg: Message): MessageHandlerOptions | undefined => {
    
    let textList = text.split('<br/>');
    if (textList.length < 1) {
        return undefined;
    }

    let allowPerson = msg.from()?.name();

    let result: MessageHandlerOptions = {
        keyword: '',
        mentionSelf: false,
        schedule: {},
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
                result.keyword = matchVal === undefined ? '' : matchVal;
            } else if (matchKey === '是否定时') {
                if (result.schedule) {
                    result.schedule.enable = matchVal === '是' ? true : false;
                }
            } else if (matchKey === '定时时间') {
                if (result.schedule && matchVal) {
                    result.schedule.time = Schedule.format(matchVal);
                }
            } else if (matchKey === '允许群') {
                result.allow = result.allow || {};
                result.allow.group = matchVal ? matchVal.split(/[,，]/) : undefined;
            } else if (matchKey === '允许人') {
                result.allow = result.allow || {};
                if (matchVal) {
                    result.allow.person?.concat(matchVal.split(/[,，]/));
                }
            } else if (matchKey === '定时回复人') {
                if (result.schedule && matchVal) {
                    result.schedule.replyTo = result.schedule.replyTo || {};
                    result.schedule.replyTo.person = matchVal.split(/[,，]/);
                }
            } else if (matchKey === '定时回复群') {
                if (result.schedule && matchVal) {
                    result.schedule.replyTo = result.schedule.replyTo || {};
                    result.schedule.replyTo.group = matchVal.split(/[,，]/);
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
    return !result.keyword ? undefined : result;
};

/**
 * 解析单行数据
 * @param text 
 * @param msg 
 */
const parseSingleLineMsg = (text: string, msg: Message): MessageHandlerOptions | undefined => {
    let textList = text.split(/\s+/);
    console.log('[message.ts/138] textList: ', textList);
    
    let result: MessageHandlerOptions = { keyword: '', mentionSelf: false, msg: msg };

    if (textList.length === 1) {
        result.keyword = textList[0];
    } else if (textList.length === 2) {
        result.ruleName = textList[0] === '-' ? undefined : textList[0];
        result.keyword = textList[1];
    }
    console.log('[message.ts/150] result: ', result);

    return !result.keyword && !result.ruleName ? undefined : result;
};

export default {
    parse(msg: Message, selfName: string): MessageHandlerOptions | undefined {

        let isText = msg.type() === Message.Type.Text;
        if (!isText) {
            return undefined;
        }

        let text = msg.text().trim();
        if (!text) {
            return undefined;
        }

        // 群消息时，判断是否 @自己
        let reg = new RegExp(`^@${selfName}\\s+`);
        let mentionSelf: boolean = false;
        if (reg.test(text)) {
            mentionSelf = true;
            text = text.replace(reg, '');
        }
        
        // 处理单行和多行消息
        let result;
        if (isMultiLineMsg(text)) {
            console.log('[message.ts/163] multi line msg: ');
            result = parseMultiLineMsg(text, msg);
        } else {
            console.log('[message.ts/163] signle msg: ');
            result = parseSingleLineMsg(text, msg);
        }

        // 针对 @自己 的做特殊标识
        if (result) {
            result.mentionSelf = mentionSelf;
        }
        return result;
    }
};
