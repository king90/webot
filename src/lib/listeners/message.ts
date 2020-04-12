import { Message, Wechaty, Contact, FileBox, Room } from 'wechaty';
import RuleDB from '../db/rule';
import service from '../service';
import MessageHandler, { MessageHandlerOptions } from '../service/message';
import UserService from '../service/user';

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

        // const instance = await db.instance;
        const selfName = bot.userSelf().name();
        let parsedMsg: MessageHandlerOptions | undefined = MessageHandler.parse(msg, selfName);
        if (!parsedMsg) {
            return;
        }

        console.log('[message.ts/33] parsedMsg: ', parsedMsg);
        // 记录user
        let contact: Contact | null = msg.from();
        if (contact) {
            UserService.saveOrUpdate(contact.id, contact.name());
        }
        
        let ruleModel = await RuleDB.getInstance() as any;

        let findRule;
        if (parsedMsg.ruleName) {
            findRule = ruleModel.find({
                keyword: parsedMsg.ruleName
            }).value();
        } else {
            findRule = ruleModel.find({
                keyword: parsedMsg.keyword
            }).value();
        }

        console.log('[message.ts/53] findRule: ', findRule);

        const room: Room | null = msg.room(); // 是否是群消息
        if (room) {//处理群消息
            if (!findRule) {
                return;
            }
            console.log('[message.ts/33] room: ', room);
            await onWebRoomMessage(parsedMsg, findRule);
        } else {
            //处理用户消息  判断消息是否为文本格式
            await onPeopleMessage(parsedMsg, findRule);
        }
    }
}


async function replyMessage(msg: Message, text: any) {
    if (text === undefined) {
        return;
    }
    let result = isObject(text) ? JSON.stringify(text, null, 2) : text;
    
    await delay(random());
    await msg.say(result);
}

async function replyMessageInRoom(room: Room, text: any, replyUser?: string) {
    if (text === undefined) {
        return;
    }
    let result = isObject(text) ? `<br/>${JSON.stringify(text, null, 2)}` : text;
    if (replyUser !== undefined) {
        result = `@${replyUser} ${result}`;
    }
    await delay(random());
    await room.say(result);
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
    
    await service.log({
        from: {
            id: contact.id,
            name: nickName
        },
        room: undefined,
        data: content
    }).catch((err: any) => {
        console.log(err);
    });

    if (!rule) {
        await replyMessage(msg, '没找到对应任务');
        return;
    }
    
    let allow = rule.allow.person || [];
    if (!allow.includes(nickName)) {
        console.log('[message.ts/112] not allow: ');
        return;
    }

    // TODO: 未来可扩展到多个任务
    let currentHandle = rule.handler[0] || {};
    let execute = service.getService(currentHandle.name);
    console.log('[message.ts/120] execute: ', execute);
    if (execute) {
        let result: any;
        try {
            result = await execute(newMsg);
            console.log('[message.ts/136] result: ', result);
        } catch (error) {
            result = error.toString();
        }
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
    await service.log({
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

    if (!allow.includes(room.id) && !allow.includes(roomPayload.topic)) {
        console.log('[message.ts/160] not allow: ');
        return;
    }

    if (!newMsg.mentionSelf) {
        console.log('[message.ts/176] no mention self, so dismiss: ');
        return;
    }

    const nickName = payload.name;
    // TODO: 未来可扩展到多个任务
    let currentHandle: any = rule.handler[0] || {};
    let execute = service.getService(currentHandle.name);
    console.log('[message.ts/168] execute: ', execute);
    if (execute) {
        let result: any;
        try {
            result = await execute(newMsg);
            console.log('[message.ts/195] result: ', result);
        } catch (error) {
            result = error.toString() || '操作失败';
        }
        await replyMessageInRoom(room, result, nickName);
    }
}

export default onMessage;