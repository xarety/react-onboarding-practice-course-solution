import { injectable, inject } from '@servicetitan/react-ioc';

import { InMemoryDataSource } from '../../common/components/kendo-grid/data-sources';
import { KendoGridState } from '../../common/components/kendo-grid/kendo-grid-state';

import { UsersApi, User, UserRole } from '../api/users.api';

import { FormState, FieldState } from 'formstate';
import { setFormStateValues } from '../../common/utils/form-helpers';

@injectable()
export class ManageUsersStore {
    gridState = new KendoGridState<User, number>({
        getFormState: this.getFormState,
        pageSize: 100
    });

    constructor(@inject(UsersApi) private readonly usersApi: UsersApi) {
        this.initialize();
    }

    private async initialize() {
        try {
            const users = (await this.usersApi.getAll()).data;

            this.gridState.setDataSource(new InMemoryDataSource(users, dataItem => dataItem.id));
        } catch {
            this.gridState.setDataSource(null);
        }
    }

    private getFormState(row: User) {
        return setFormStateValues(
            new FormState({
                id: new FieldState(0),
                login: new FieldState(''),
                password: new FieldState(''),
                role: new FieldState(UserRole.Public)
            }),
            row
        );
    }

    edit(user: User) {
        this.gridState.edit(user);
    }

    cancel(user: User) {
        this.gridState.cancelEdit(user);
    }

    save(user: User) {
        this.gridState.saveEdit(user, async changes => {
            await this.usersApi.update(changes.id, changes);
        });
    }

    async delete(user: User) {
        await this.usersApi.delete(user.id);

        this.gridState.removeFromDataSource(user.id);
    }
}
