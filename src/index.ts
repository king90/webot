import { Wechaty } from 'wechaty';
import * as path from 'path';

const getListenerFileName = (name: string) => {
    return path.join(__dirname, '../dist', name);
};

const bot = new Wechaty();
bot.on('login', getListenerFileName('./lib/listeners/login'));
bot.on('message', getListenerFileName('./lib/listeners/message'));
bot.on('scan', getListenerFileName('./lib/listeners/scan'));
// bot.on('friendship', getListenerFileName('./listeners/friendship'));
bot.start()
    .then(() => console.log('开始登陆微信'))
    .catch(e => console.error(e));

export default bot;
