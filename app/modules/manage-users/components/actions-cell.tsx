import * as React from 'react';

import { useDependencies } from '@servicetitan/react-ioc';

import { Button, Dialog } from '@servicetitan/design-system';

import { GridCell, GridCellProps } from '@progress/kendo-react-grid';

import { ManageUsersStore } from '../stores/manage-users.store';

import { Confirm, ConfirmationProps } from '../../common/components/confirm/confirm';

export const ActionsCell: React.FC<GridCellProps> = (props) => {
    const [manageUsersStore] = useDependencies(ManageUsersStore);

    const { dataItem, rowType } = props;

    if (rowType !== 'data') {
        return <GridCell {...props} />;
    }

    const handleCancel = () => manageUsersStore.cancel(dataItem);
    const handleSave = () => manageUsersStore.save(dataItem);
    const handleEdit = () => manageUsersStore.edit(dataItem);
    const handleDelete = () => manageUsersStore.delete(dataItem);

    return (
        <td>
            {dataItem.inEdit ?
                (
                    <React.Fragment>
                        <Button text onClick={handleCancel}>
                            Cancel
                        </Button>

                        <Button text primary onClick={handleSave}>
                            Save
                        </Button>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <Button text primary onClick={handleEdit}>
                            Edit
                        </Button>

                        <Confirm
                            confirmation={DeleteConfirmation}
                            onClick={handleDelete}
                        >
                            {onClick => (
                                <Button text negative onClick={onClick}>
                                    Delete
                                </Button>
                            )}
                        </Confirm>
                    </React.Fragment>
                )
            }
        </td>
    );
};

const DeleteConfirmation: React.FC<ConfirmationProps> = ({ onCancel, onConfirm }) => (
    <Dialog
        open
        closable
        onClose={onCancel}
        title="Delete User"
        onPrimaryActionClick={onConfirm}
        primaryActionName="Delete"
        onSecondaryActionClick={onCancel}
        secondaryActionName="Cancel"
        negative
    >
        Are you sure you want to delete this user?
    </Dialog>
);
