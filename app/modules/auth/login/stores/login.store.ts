import { injectable, inject } from '@servicetitan/react-ioc';

import { observable, action, computed } from 'mobx';

import { FormState } from 'formstate';
import { InputFieldState, formStateToJS } from '../../../common/utils/form-helpers';

import { AuthStore } from '../../../common/stores/auth.store';
import { FormValidators } from '../../../common/utils/form-validators';

@injectable()
export class LoginStore {
    @observable error?: string;

    form = new FormState({
        login: new InputFieldState('').validators(FormValidators.required),
        password: new InputFieldState('').validators(FormValidators.required)
    });

    @computed
    get isDirty() {
        const { $: { login, password } } = this.form;
        return login.dirty && password.dirty;
    }

    constructor(@inject(AuthStore) private readonly authStore: AuthStore) { }

    @action
    private setError(error: string | undefined) {
        this.error = error;
    }

    async login() {
        const res = await this.form.validate();
        if (res.hasError) {
            return false;
        }

        await this.authStore.login(formStateToJS(this.form));

        this.setError(
            !this.authStore.isAuthenticated
                ? 'Incorrect username or password.'
                : undefined
        );

        return this.authStore.isAuthenticated;
    }
}
