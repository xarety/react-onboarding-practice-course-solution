import * as React from 'react';

import { Dialog } from '@servicetitan/design-system';

interface Defer {
    confirm(): void;
    cancel(): void;
}

interface ConfirmProps<T> {
    onClick: T;
    confirmation?: React.ComponentType<ConfirmationProps>;
    children(onClick: T): JSX.Element;
}

export const Confirm = <T extends (...args: any[]) => any>({
    onClick,
    confirmation: Confirmation = DefaultConfirmation,
    children
}: ConfirmProps<T>) => {
    const [defer, setDefer] = React.useState<Defer | undefined>(undefined);

    const handleClick = async (...args: any[]) => {
        try {
            await new Promise((resolve, reject) => {
                setDefer({
                    confirm: resolve,
                    cancel: reject
                });
            });
        } catch {
            return;
        } finally {
            setDefer(undefined);
        }

        onClick(...args);
    };

    return (
        <React.Fragment>
            {children(handleClick as T)}

            {defer && (
                <Confirmation
                    onConfirm={defer.confirm}
                    onCancel={defer.cancel}
                />
            )}
        </React.Fragment>
    );
};

export interface ConfirmationProps {
    onConfirm(): void;
    onCancel(): void;
}

const DefaultConfirmation: React.FC<ConfirmationProps> = ({ onConfirm, onCancel }) => (
    <Dialog
        open
        closable
        onClose={onCancel}
        title="Are you sure?"
        onPrimaryActionClick={onConfirm}
        primaryActionName="Confirm"
        onSecondaryActionClick={onCancel}
        secondaryActionName="Cancel"
    />
);
