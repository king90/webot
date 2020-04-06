import { Message, Wechaty, Contact, FileBox, Room } from 'wechaty';
import * as path from 'path';
import db from '../db';
import handler from './handler';
import MessageHandler, { MessageHandlerOptions } from './handler/message';
import UserHandler from './handler/user';

import bot from '../../index';

// sleep
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const random = () => Math.floor(Math.random() * 500) + 100;

const isObject = (val: any) => Object.prototype.toString.call(val) === '[object Object]';

/**
 * 处理消息
 */
async function onMessage(msg: Message) {
    //防止自己和自己对话
    if (msg.self()) {return;}
    const isText = msg.type() === bot.Message.Type.Text;
    if (isText) {
        console.log('[message.ts/21] msg.text().trim(): ', msg.text().trim());

        const instance = await db.instance;
        
        let parsedMsg: MessageHandlerOptions | undefined = MessageHandler.parse(msg);
        if (!parsedMsg) {
            return;
        }
    
        // 记录user
        let contact: Contact | null = msg.from();
        if (contact) {
            UserHandler.saveOrUpdate(contact.id, contact.name());
        }
        
        let ruleModel = instance.get(db.TB_RULE) as any;

        let findRule;
        if (parsedMsg.ruleName) {
            findRule = ruleModel.find({
                keywords: parsedMsg.ruleName
            }).value();
        } else {
            findRule = ruleModel.find({
                keywords: parsedMsg.keywords
            }).value();
        }

        console.log('[message.ts/24] findRule: ', findRule);

        if (!findRule) {
            return;
        }

        const room: Room | null = msg.room(); // 是否是群消息
        if (room) {//处理群消息
            console.log('[message.ts/33] room: ', room);
            await onWebRoomMessage(parsedMsg, findRule);
        } else {
            //处理用户消息  判断消息是否为文本格式
            await onPeopleMessage(parsedMsg, findRule);
        }
    }
}


async function replyMessage(msg: Message, text: any, replyUser?: string) {
    if (text === undefined) {
        return;
    }
    let result = isObject(text) ? JSON.stringify(text, null, 2) : text;
    if (replyUser !== undefined) {
        result = `@${replyUser}，\n${result}`;
    }
    await delay(random());
    await msg.say(result);
}

/**
 * 处理用户消息
 */
// tslint:disable
async function onPeopleMessage(newMsg: MessageHandlerOptions, rule: any) {
    let msg: Message = newMsg.msg;
    //发消息人
    const contact: Contact | null = msg.from();
    if (!contact) {
        return;
    }
    
    const { payload } = contact as any;
    const nickName = payload.name;
    let content = msg.text().trim(); // 消息内容  未省去不必要的麻烦，使用trim()去除前后空格
    
    await handler.log({
        from: {
            id: contact.id,
            name: nickName
        },
        room: undefined,
        data: content
    }).catch((err: any) => {
        console.log(err);
    });
    
    let allow = rule.allow.person || [];
    if (!allow.includes(contact.id)) {
        return;
    }


    // TODO: 未来可扩展到多个任务
    let currentHandle = rule.handler[0] || {};
    let execute = handler.get(currentHandle.name);
    if (execute) {
        let result: any = await execute(newMsg);
        console.log('[message.ts/83] result: ', result);
        await replyMessage(msg, result);
    }
}
/**
 * 处理群消息
 */
async function onWebRoomMessage(newMsg: MessageHandlerOptions, rule: any) {
    let msg: Message = newMsg.msg;
    const contact: Contact | null = msg.from();
    const room: Room | null = msg.room();

    const { payload } = contact as any;
    
    if (!contact || !payload || !room) {
        return;
    }

    let allow = rule.allow.group || [];
    let content = msg.text().trim(); // 消息内容  未省去不必要的麻烦，使用trim()去除前后空格

    const roomPayload = (room as any).payload;
    await handler.log({
        from: {
            id: contact.id,
            name: payload.name
        },
        room: {
            id: room.id,
            name: roomPayload.topic
        },
        data: content
    }).catch((err: any) => {
        console.log(err);
    });

    if (!allow.includes(room.id) || !allow.includes(roomPayload.topic)) {
        return;
    }

    const nickName = payload.name;
    // TODO: 未来可扩展到多个任务
    let currentHandle: any = rule.handler[0] || {};
    let execute = handler[currentHandle.name];
    if (execute) {
        let result: any = await execute(content);
        console.log('[message.ts/83] result: ', result);
        await replyMessage(msg, result, nickName);
    }
}

export default onMessage;