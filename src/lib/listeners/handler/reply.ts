import RuleHandler from './rule';
import { MessageHandlerOptions } from './message';

export default {
    async autoReply(data: MessageHandlerOptions) {
        return new Promise(async (resolve, reject) => {
            const result: any = await RuleHandler.findRule(data.keywords);
            let replyMsg;
            for (let i = 0; i < result.handler.length; i++) {
                let item = result.handler[i];
                if (item.name === 'autoReply') {
                    replyMsg = item.data;
                    break;
                }
            }
            resolve(replyMsg);
        });
    },

};
