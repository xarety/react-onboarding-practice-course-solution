import * as React from 'react';

import {
    DefaultConfirmation,
    DefaultConfirmationProps
} from './confirmation-messages/default-confirmation';

interface Defer {
    confirm(): void;
    decline(): void;
    cancel(): void;
}

export interface ConfirmationProps {
    title?: string;
    message?: string;
    onConfirm(): void;
    onDecline(): void;
    onCancel(): void;
}

export type ConfirmProps<P extends ConfirmationProps> = {
    when?: boolean;
    confirmation?: React.ComponentType<P>;
} & Omit<P, 'onConfirm' | 'onDecline' | 'onCancel'>;

export function useConfirm<T extends (...args: any[]) => any>(onConfirm: T, onDecline?: T) {
    const [defer, setDefer] = React.useState<Defer | undefined>(undefined);

    const handler = React.useCallback(
        async (...args: any[]) => {
            let isConfirmed: boolean;

            try {
                isConfirmed = await new Promise((resolve, reject) => {
                    setDefer({
                        confirm: () => resolve(true),
                        decline: () => resolve(false),
                        cancel: reject
                    });
                });
            } catch {
                return;
            } finally {
                setDefer(undefined);
            }

            if (isConfirmed) {
                onConfirm(...args);
            } else if (onDecline) {
                onDecline(...args);
            }
        },
        [onConfirm, onDecline]
    );

    const Confirm = React.useMemo(
        () => <P extends ConfirmationProps = DefaultConfirmationProps>({
            when = true,
            confirmation: Confirmation = DefaultConfirmation as React.ComponentType<P>,
            ...props
        }: ConfirmProps<P>) => {
            if (!defer) {
                return null;
            }

            if (!when) {
                defer.confirm();
                return null;
            }

            return (
                <Confirmation
                    {...(props as P)}
                    onConfirm={defer.confirm}
                    onDecline={defer.decline}
                    onCancel={defer.cancel}
                />
            );
        },
        [defer]
    );

    return [Confirm, handler] as [typeof Confirm, T];
}
