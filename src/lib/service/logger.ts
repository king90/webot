import * as dayjs from 'dayjs';

import LoggerDB, { LOGGER_TABLE } from '../db/logger';

export default {
    log(data: any) {
        return new Promise(async (resolve, reject) => {
            LoggerDB.getInstance(LOGGER_TABLE.LOG).push({
                type: 'text',
                createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                from: data.from,
                room: data.room,
                data: data.data
            }).write();
            resolve('日志添加成功');
        });
    },

    logSchedule(data: any) {
        return new Promise(async (resolve, reject) => {
            LoggerDB.getInstance(LOGGER_TABLE.SCHEDULE).push({
                createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                data: data.data
            }).write();
        });
    }
};


