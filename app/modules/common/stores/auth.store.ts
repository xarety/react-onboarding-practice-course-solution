import { injectable, inject } from '@servicetitan/react-ioc';

import { observable, computed, action, runInAction } from 'mobx';

import { AuthApi, User, LoginRequest } from '../api/auth.api';

@injectable()
export class AuthStore {
    @observable user?: User;

    @computed
    get isAuthenticated() {
        return !!this.user;
    }

    constructor(@inject(AuthApi) private readonly authApi: AuthApi) { }

    async login(request: LoginRequest) {
        try {
            const user = (await this.authApi.login(request)).data;

            runInAction(() => {
                this.user = user;
            });
        } catch {
            runInAction(() => {
                this.user = undefined;
            });
        }
    }

    @action
    logout() {
        this.user = undefined;
    }
}
