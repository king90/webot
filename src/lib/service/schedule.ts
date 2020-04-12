import schedule = require('node-schedule');
import RuleService, { RuleEnableEnum } from './rule';
import ReplyService from './reply';
import bot from '../../index';
import LoggerService from './logger';
// const bot = {};

const getReg = (name: string) => {
    return new RegExp(`^[\\d\\/,-\\\\*]+${name}`);
};

export default class Schedule {
    static scheduleList: any = {};

    static check(data: string) {
        return /(([\d\/,-\\*]+|\*)\s){5}(\d+|\*)/.test(data);
    }

    static format(data: string): string | undefined {
        console.log(getReg('s'));
        console.log(data);
        console.log(getReg('s').test(data));
        if (getReg('s').test(data)) {
            return `${data.replace('s', '')} * * * * *`;
        } else if (getReg('m').test(data)) {
            return `* ${data.replace('m', '')} * * * *`;
        } else if (getReg('h').test(data)) {
            return `* * ${data.replace('h', '')} * * *`;
        } else if (Schedule.check(data)) {
            return data;
        }
        return undefined;
    }

    static remove(key: string) {
        let job = Schedule.scheduleList[key];
        if (job) {
            job.cancel();
        }
    }

    async reply(data: any) {
        console.log('[schedule.ts/42] reply: ');
        let schedule = data.schedule || {};
        let { person, group } = schedule.replyTo || {};
        if (group) {
            console.log('[schedule.ts/46] group: ', group);
            for (let i = 0; i < group.length; i++) {
                if (group[i] !== undefined) {
                    const room = await bot.Room.find({
                        topic: group[i]
                    });
                    console.log('[schedule.ts/52] room: ', room);
                    if (room) {
                        let replyData = ReplyService.getReplyData(data);
                        console.log('[schedule.ts/55] replyData: ', replyData);
                        if (replyData) {
                            await LoggerService.logSchedule({
                                data: {
                                    type: 'room',
                                    reply: replyData,
                                    room: group[i]
                                }
                            });

                            await room.say(replyData);
                        }
                    }
                }
            }
        }
        if (person) {
            console.log('[schedule.ts/62] person: ', person);
            for (let i = 0; i < person.length; i++) {
                if (person !== undefined) {
                    const contact = await bot.Contact.find(person[i]);
                    console.log('[schedule.ts/67] contact: ', contact);
                    if (contact) {
                        let replyData = ReplyService.getReplyData(data);
                        if (replyData) {
                            await LoggerService.logSchedule({
                                data: {
                                    type: 'person',
                                    reply: replyData,
                                    contact: contact.name()
                                }
                            });

                            console.log('[schedule.ts/72] replyData: ', replyData);
                            await contact.say(replyData);
                        }
                    }
                }
            }
        }
    }

    add(key: string, data: string) {
        if (Schedule.scheduleList[key]) {
            Schedule.remove(key);
        }
        console.log('[schedule.ts/15] add : ', data);
        const job = schedule.scheduleJob(data, async () => {
            console.log('schedule execute: keyword is ' + key + ' at ' + new Date());
            
            let result: any = await RuleService.findRule(key);
            console.log('[schedule.ts/90] result: ', result);
            let enableRule = [RuleEnableEnum.ACTIVE, RuleEnableEnum.REACTIVE];
            if (result && enableRule.indexOf(result.enable) >= 0 && result.schedule && result.schedule.enable) {
                new Schedule().reply(result);
            } else {
                console.log('[schedule.ts/94] no match schedule: ');
            }
        });
        Schedule.scheduleList[key] = job;
        return true;
    }

    checkAndAdd(key: string, data: string) {
        console.log('[schedule.ts/31] check and add: ');
        if (/((\d+|\*)\s){5}(\d+|\*)/.test(data)) {
            return this.add(key, data);
        }
        console.log('[schedule.ts/31] not match: ', data);
        return false;
    }
}