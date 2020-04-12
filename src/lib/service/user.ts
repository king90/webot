import * as dayjs from 'dayjs';
import UserDB from '../db/user';

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
            const result = UserDB.getInstance()
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
            const result = UserDB.getInstance()
                .push({ id, name, updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')})
                .write();
            resolve(result);
        });
    },
    findById(id: string) {
        return new Promise(async (resolve, reject) => {
            const result = UserDB.getInstance()
                .find({ id })
                .value();
            resolve(result);
        });
    },
    findByName(name: string) {
        return new Promise(async (resolve, reject) => {
            const result = UserDB.getInstance()
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
