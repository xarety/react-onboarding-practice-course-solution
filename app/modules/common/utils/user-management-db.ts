import { User } from '../api/auth.api';

import { cloneDeep } from './clone-deep';
import { getRandomId } from './get-random-id';

export const John = {
    id: 1,
    login: 'john',
    password: 'test',
    role: 'Public'
} as User;

export const Mike = {
    id: 2,
    login: 'mike',
    password: 'test',
    role: 'Admin'
} as User;

export const Sam = {
    id: 3,
    login: 'sam',
    password: 'test',
    role: 'Operator'
} as User;

class UserManagementDB {
    private readonly users: User[];

    constructor() {
        this.users = [John, Mike, Sam];
    }

    getAll() {
        return cloneDeep(this.users);
    }

    getByLogin(login: string) {
        return cloneDeep(this.users.find(user => user.login === login));
    }

    private getById(id: number) {
        return this.users.find(user => user.id === id);
    }

    create(data: User) {
        const user: User = {
            ...data,
            id: getRandomId()
        };

        this.users.push(user);

        return cloneDeep(user);
    }

    update(id: number, changes: Partial<User>) {
        const user = this.getById(id);

        if (user) {
            return cloneDeep(Object.assign(user, changes));
        }
    }

    delete(id: number) {
        const user = this.getById(id);

        if (user) {
            this.users.splice(this.users.indexOf(user), 1);
            return cloneDeep(user);
        }
    }
}

const instance = new UserManagementDB();

export { instance as UserManagementDB };
