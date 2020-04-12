import schedule = require('node-schedule');
import bot from '../../../index';

export default class Schedule {
    static scheduleList: any = {};

    static check(data: string) {
        return /(([\d\/,-]+|\*)\s){5}(\d+|\*)/.test(data);
    }

    static add(key: string, data: string) {
        if (Schedule.scheduleList[key]) {
            Schedule.remove(key);
        }
        console.log('[schedule.ts/15] add : ', data);
        const job = schedule.scheduleJob(data, ()=>{
            console.log('schedule execute: keyword is ' + key + ' at ' + new Date());
        });
        Schedule.scheduleList[key] = job;
        return true;
    }

    static remove(key: string) {
        let job = Schedule.scheduleList[key];
        if (job) {
            job.cancel();
        }
    }

    static checkAndAdd(key: string, data: string) {
        console.log('[schedule.ts/31] check and add: ');
        if (/((\d+|\*)\s){5}(\d+|\*)/.test(data)) {
            return Schedule.add(key, data);
        }
        console.log('[schedule.ts/31] not match: ', data);
        return false;
    }
}