import db from '../../db';

const TABLE_GROUP = db.TB_GROUP;

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
            const result = instance.get(TABLE_GROUP)
                .find({ id })
                .assign({ name })
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
            const result = instance.get(TABLE_GROUP)
                .push({ id, name })
                .write();
            resolve(result);
        });
    },
    findById(id: string) {
        return new Promise(async (resolve, reject) => {
            const instance = await db.instance;
            const result = instance.get(TABLE_GROUP)
                .find({ id })
                .value();
            resolve(result);
        });
    },
    findByName(name: string) {
        return new Promise(async (resolve, reject) => {
            const instance = await db.instance;
            const result = instance.get(TABLE_GROUP)
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
