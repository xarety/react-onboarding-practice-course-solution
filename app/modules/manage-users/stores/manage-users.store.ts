import { injectable, inject } from '@servicetitan/react-ioc';

import { Location } from 'history';

import { KendoGridState, InMemoryDataSource } from '../../common/components/kendo-grid/kendo-grid-state';

import { UsersApi, User, UserRole } from '../api/users.api';

import { FormState, FieldState } from 'formstate';
import { setFormStateValues } from '../../common/utils/form-helpers';

@injectable()
export class ManageUsersStore {
    gridState = new KendoGridState({
        idSelector: dataItem => dataItem.id,
        getFormState: this.getFormState,
        pageSize: 100
    });

    constructor(@inject(UsersApi) private readonly usersApi: UsersApi) {
        this.initialize();
    }

    private async initialize() {
        try {
            const users = (await this.usersApi.getAll()).data;

            this.gridState.setDataSource(
                new InMemoryDataSource(users)
            );
        } catch {
            this.gridState.setDataSource(
                new InMemoryDataSource([])
            );
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

    confirmNavigation = (currentPathname: string) => (location: Location) => {
        if (this.gridState.inEdit.size && location.pathname !== currentPathname) {
            return currentPathname;
        }

        return true;
    }

    edit(user: User) {
        this.gridState.edit(user);
    }

    cancel(user: User) {
        this.gridState.cancelEdit(user);
    }

    save(user: User) {
        this.gridState.saveEdit(
            user,
            async (changes) => {
                await this.usersApi.update(changes.id, changes);
            }
        );
    }

    async delete(user: User) {
        await this.usersApi.delete(user.id);

        this.gridState.removeFromDataSource(
            dataItem => dataItem.id === user.id
        );
    }
}
