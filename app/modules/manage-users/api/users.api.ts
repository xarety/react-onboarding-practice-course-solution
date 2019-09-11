import { injectable } from '@servicetitan/react-ioc';

import { AxiosPromise } from 'axios';

import { User, UserRole } from '../../common/api/auth.api';

import { UserManagementDB } from '../../common/utils/user-management-db';

export interface IUsersApi {
    getAll(): AxiosPromise<User[]>;
    update(id: number, user: User): AxiosPromise<void>;
    delete(id: number): AxiosPromise<void>;
}

@injectable()
export class UsersApi implements IUsersApi {
    getAll(): AxiosPromise<User[]> {
        return this.resolve(UserManagementDB.getAll());
    }

    update(id: number, changes: User): AxiosPromise<void> {
        const user = UserManagementDB.update(id, changes);

        if (user) {
            return this.resolve();
        }

        return this.reject();
    }

    delete(id: number): AxiosPromise<void> {
        const user = UserManagementDB.delete(id);

        if (user) {
            return this.resolve();
        }

        return this.reject();
    }

    private resolve<T = void>(data?: T) {
        return Promise.resolve({
            data
        }) as AxiosPromise<T>;
    }

    private reject() {
        return Promise.reject({
            code: '500'
        });
    }
}

export { User, UserRole };
