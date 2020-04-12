import RuleHandler from './rule';
import ReplyHandler from './reply';
import { MessageHandlerOptions } from './message';
import LoggerService from './logger';

const handler: any = {
    getService(name: string) {
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
            const result = await ReplyHandler.autoReply(data);
            resolve(result);
        });
    },

    addRule(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            let findRule: any = await RuleHandler.findRule(data.keyword);
            if (!findRule) {
                let result = await RuleHandler.addRule(data);
                resolve('添加成功');
                return;
            }
            reject('添加失败，规则已存在');
        });
    },
    
    updateRule(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            let findRule: any = await RuleHandler.findRule(data.keyword);
            if (findRule) {
                await RuleHandler.updateRule(findRule.id, data);
                resolve(`规则更新成功`);
                return;
            }
            reject('规则更新失败');
        });
    },

    pauseRule(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            console.log('[index.ts/57] pauseRule: ');
            let keyword = data.keyword;
            let result: any = await RuleHandler.pauseRule(keyword);
            resolve(`${result.keyword} 规则已暂停`);
        });
    },

    activeRule(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            let keyword = data.keyword;
            let result: any = await RuleHandler.activeRule(keyword);
            resolve(`${result.keyword} 规则已重新激活`);
        });
    },

    deleteRule(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            let findRule: any = await RuleHandler.findRule(data.keyword);
            if (findRule) {
                RuleHandler.deleteRule(findRule.id);
                resolve('删除成功');
                return;
            }
            reject('删除失败');
        });
    },

    log(data: any) {
        return new Promise(async (resolve, reject) => {
            await LoggerService.log(data);
        });
    }
};

export default handler;