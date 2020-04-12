import * as dayjs from 'dayjs';
import db from '../../db';

const TABLE_USER = db.TB_USER;

export default {
    saveOrUpdate(id: string, name: string) {
        return new Promise(async (resolve, reject) => {
            let result;
            let findUser: any = await this.findById(id);
            if (findUser) {
                result = await this.update(id, name);
            } else {
                result = await this.save(id, name);
            }
            resolve(result);
        });
    },
    update(id: string, name: string) {
        return new Promise(async (resolve, reject) => {
            const instance = await db.instance;
            const result = instance.get(TABLE_USER)
                .find({ id })
                .assign({ name, updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss') })
                .write();
            resolve(result);
        });
    },
    save(id: string, name: string) {
        return new Promise(async (resolve, reject) => {
            let findUser: any = await this.findById(id);
            if (findUser) {
                reject();
                return;
            }
            const instance = await db.instance;
            const result = instance.get(TABLE_USER)
                .push({ id, name, updatTime: dayjs().format('YYYY-MM-DD HH:mm:ss')})
                .write();
            resolve(result);
        });
    },
    findById(id: string) {
        return new Promise(async (resolve, reject) => {
            const instance = await db.instance;
            const result = instance.get(TABLE_USER)
                .find({ id })
                .value();
            resolve(result);
        });
    },
    findByName(name: string) {
        return new Promise(async (resolve, reject) => {
            const instance = await db.instance;
            const result = instance.get(TABLE_USER)
                .find({ name })
                .value();
            resolve(result);
        });
    },
    findByIdOrName(val: string) {
        return new Promise(async (resolve, reject) => {
            let result = await this.findById(val);
            if (!result) {
                result = await this.findByName(val);
            }
            resolve(result);
        });
    }
};
