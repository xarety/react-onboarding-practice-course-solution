import * as React from 'react';
import { RouteComponentProps, Prompt } from 'react-router-dom';

import { provide, useDependencies } from '@servicetitan/react-ioc';

import { Page } from '@servicetitan/design-system';

import { KendoGrid } from '../../common/components/kendo-grid/kendo-grid';
import { GridColumn } from '@progress/kendo-react-grid';
import { StandardColumnMenuFilter } from '../../common/components/kendo-grid/filters/column-menu-filters';
import { singleItemMultiSelectColumnMenuFilter } from '../../common/components/kendo-grid/filters/multiselect-filter/multiselect-filter';
import { getSelectEditableCell, TextEditableCell } from '../../common/components/kendo-grid/editable-cell';
import { PasswordEditableCell } from './password-editable-cell';
import { ActionsCell } from './actions-cell';

import { UsersApi, UserRole } from '../api/users.api';

import { ManageUsersStore } from '../stores/manage-users.store';

import { getEnumValues } from '../../common/utils/form-helpers';

const RolesEditableCell = getSelectEditableCell(getEnumValues(UserRole));
const RolesColumnMenuFilter = singleItemMultiSelectColumnMenuFilter(getEnumValues(UserRole));

export const ManageUsers: React.FC<RouteComponentProps> = provide({ singletons: [UsersApi, ManageUsersStore] })(
    ({ location }) => {
        const [{ gridState, confirmNavigation }] = useDependencies(ManageUsersStore);

        return (
            <Page>
                <KendoGrid gridState={gridState} groupable sortable>
                    <GridColumn
                        field="id"
                        editable={false}
                        groupable={false}
                    />

                    <GridColumn
                        field="login"
                        cell={TextEditableCell}
                        groupable={false}
                        columnMenu={StandardColumnMenuFilter}
                    />

                    <GridColumn
                        field="password"
                        cell={PasswordEditableCell}
                        groupable={false}
                        sortable={false}
                    />

                    <GridColumn
                        field="role"
                        cell={RolesEditableCell}
                        columnMenu={RolesColumnMenuFilter}
                    />

                    <GridColumn
                        cell={ActionsCell}
                        groupable={false}
                        sortable={false}
                    />
                </KendoGrid>

                <Prompt message={confirmNavigation(location.pathname)} />
            </Page>
        );
    }
);
