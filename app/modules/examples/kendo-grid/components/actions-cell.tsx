import * as React from 'react';

import { Button, Icon, Stack } from '@servicetitan/design-system';

import { KendoGridCellProps } from '../../../common/components/kendo-grid/kendo-grid';
import {
    getActionCell,
    EditActionProps
} from '../../../common/components/kendo-grid/editable-cell';

import { Product } from '../utils/product';

const ViewAction: React.FC<KendoGridCellProps<Product>> = ({ gridState, dataItem }) => {
    if (!gridState) {
        return <td />;
    }

    const edit = () => gridState.edit(dataItem);

    return (
        <td>
            <Button text primary onClick={edit}>
                <Icon name="edit" />
            </Button>
        </td>
    );
};

const EditAction: React.FC<EditActionProps<Product>> = ({ gridState, formState, dataItem }) => {
    if (!gridState) {
        return <td />;
    }

    const save = async () => {
        const { hasError } = await formState.validate();
        if (hasError) {
            return;
        }

        gridState.saveEdit(dataItem);
    };

    const cancel = () => gridState.cancelEdit(dataItem);

    return (
        <td>
            <Stack justifyContent="space-between">
                <Button text onClick={cancel}>
                    <Icon name="do_not_disturb" />
                </Button>

                <Button text primary onClick={save}>
                    <Icon name="done" />
                </Button>
            </Stack>
        </td>
    );
};

export const ActionsCell = getActionCell({
    view: ViewAction,
    edit: EditAction
});
