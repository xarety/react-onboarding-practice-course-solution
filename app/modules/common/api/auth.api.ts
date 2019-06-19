import { injectable } from '@servicetitan/react-ioc';

import { AxiosPromise } from 'axios';

import { UserManagementDB } from '../utils/user-management-db';

export interface IAuthApi {
    login(request: LoginRequest): AxiosPromise<User>;
    register(user: User): AxiosPromise<User>;
    isLoginInUse(login: string): AxiosPromise<boolean>;
}

@injectable()
export class AuthApi implements IAuthApi {
    login({ login, password }: LoginRequest): AxiosPromise<User> {
        const user = UserManagementDB.getByLogin(login);

        if (user && user.password === password) {
            return this.resolve(
                user
            );
        }

        return this.reject();
    }

    register(data: User): AxiosPromise<User> {
        const user = UserManagementDB.create(data);

        return this.resolve(
            user
        );
    }

    isLoginInUse(login: string): AxiosPromise<boolean> {
        const user = UserManagementDB.getByLogin(login);

        return this.resolve(
            !!user
        );
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

export interface LoginRequest {
    login: string;
    password: string;
}

export interface User {
    id: number;
    login: string;
    password: string;
    role: UserRole;
}

export enum UserRole {
    Public = 'Public',
    Operator = 'Operator',
    Admin = 'Admin'
}
