import * as React from 'react';

import { Dialog } from '@servicetitan/design-system';

import { ConfirmationProps } from '../use-confirm';

export interface DefaultConfirmationProps extends ConfirmationProps {
    negative?: boolean;
}

export const DefaultConfirmation: React.FC<DefaultConfirmationProps> = ({
    negative = true,
    title = 'Are you sure?',
    message = '',
    onConfirm,
    onCancel
}) => (
    <Dialog
        open
        closable
        negative={negative}
        onClose={onCancel}
        title={title}
        onPrimaryActionClick={onConfirm}
        primaryActionName="Confirm"
        onSecondaryActionClick={onCancel}
        secondaryActionName="Cancel"
    >
        {message}
    </Dialog>
);
