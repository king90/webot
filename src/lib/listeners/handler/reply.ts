import RuleHandler, { RuleEnableEnum } from './rule';
import { MessageHandlerOptions } from './message';

export default {
    async autoReply(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            console.log('[reply.ts/7] data: ', data);
            console.log('[reply.ts/8] data.keywords: ', data.keywords);
            const result: any = await RuleHandler.findRule(data.keywords);
            console.log('[reply.ts/8] result.enable: ', result.enable);
            console.log('[reply.ts/9] RuleEnableEnum.ACTIVE, RuleEnableEnum.REACTIVE: ', RuleEnableEnum.ACTIVE, RuleEnableEnum.REACTIVE);
            console.log('[reply.ts/9] enable ', [RuleEnableEnum.ACTIVE, RuleEnableEnum.REACTIVE].includes(result.enable));
            if (![RuleEnableEnum.ACTIVE, RuleEnableEnum.REACTIVE].includes(result.enable)) {
                reject();
                return;
            }
            let replyMsg;
            for (let i = 0; i < result.handler.length; i++) {
                let item = result.handler[i];
                if (item.name === 'autoReply') {
                    if (Array.isArray(item.data)) {
                        replyMsg = item.data.join('<br/>');
                    } else {
                        replyMsg = item.data;
                    }
                    
                    break;
                }
            }
            resolve(replyMsg);
        });
    },

};
