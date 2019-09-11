import * as React from 'react';

import { useConfirm, ConfirmProps as InnerConfirmProps, ConfirmationProps } from './use-confirm';
import { DefaultConfirmationProps } from './confirmation-messages/default-confirmation';

type ConfirmProps<T extends (...args: any[]) => any, P extends ConfirmationProps> = {
    onConfirm: T;
    onDecline?: T;
    children(handler: T): JSX.Element;
} & InnerConfirmProps<P>;

export const Confirm = <
    T extends (...args: any[]) => any,
    P extends ConfirmationProps = DefaultConfirmationProps
>({
    onConfirm,
    onDecline,
    children,
    ...props
}: ConfirmProps<T, P>) => {
    const [Confirm, handler] = useConfirm(onConfirm, onDecline);

    return (
        <React.Fragment>
            {children(handler)}

            <Confirm {...((props as unknown) as InnerConfirmProps<P>)} />
        </React.Fragment>
    );
};
