import RuleHandler, { RuleEnableEnum } from './rule';
import { MessageHandlerOptions } from './message';

export default {
    getReplyData(rule: any) {
        let replyMsg;
        for (let i = 0; i < rule.handler.length; i++) {
            let item = rule.handler[i];
            if (item.name === 'autoReply') {
                if (Array.isArray(item.data)) {
                    replyMsg = item.data.join('<br/>');
                } else {
                    replyMsg = item.data;
                }
                
                break;
            }
        }
        return replyMsg;
    },

    async autoReply(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            console.log('[reply.ts/8] data.keywords: ', data.keyword);
            
            const result: any = await RuleHandler.findRule(data.keyword);

            console.log('[reply.ts/8] result.enable: ', result.enable);

            if (![RuleEnableEnum.ACTIVE, RuleEnableEnum.REACTIVE].includes(result.enable)) {
                reject('规则不存在或已失效');
                return;
            }
            let replyMsg = this.getReplyData(result);
            
            resolve(replyMsg);
        });
    },

};
