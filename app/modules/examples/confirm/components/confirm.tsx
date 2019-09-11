import * as React from 'react';

import { Text, Stack, Button, Checkbox } from '@servicetitan/design-system';

import { useConfirm, Confirm, YesNoConfirmation } from '../../../common/components/confirm';

import { CustomConfirmation } from './custom-confirmation';

export const ConfirmExample: React.FC = () => {
    const [confirmEnabled, setConfirmEnabled] = React.useState(true);

    const handleConfirm = () => alert('Confirmed');
    const handleDecline = () => alert('Declined');

    const [HookConfirm, hookHandler] = useConfirm(handleConfirm);

    const handleChangeConfirmEnabled = (_0: never, checked: boolean) => {
        setConfirmEnabled(checked);
    };

    return (
        <React.Fragment>
            <Text size={4} className="m-b-half">
                Default confirmation
            </Text>
            <Confirm onConfirm={handleConfirm}>
                {onClick => <Button onClick={onClick}>Do Something</Button>}
            </Confirm>

            <Text size={4} className="m-t-4 m-b-half">
                Hook usage
            </Text>
            <Button onClick={hookHandler}>Do Something</Button>
            <HookConfirm />

            <Text size={4} className="m-t-4 m-b-half">
                Customized default dialog
            </Text>
            <Confirm
                negative={false}
                title="You have unsaved changes"
                message="Leave anyways?"
                onConfirm={handleConfirm}
            >
                {onClick => <Button onClick={onClick}>Do Something</Button>}
            </Confirm>

            <Text size={4} className="m-t-4 m-b-half">
                Toggleable confirmation
            </Text>
            <Stack alignItems="center">
                <Confirm when={confirmEnabled} onConfirm={handleConfirm}>
                    {onClick => <Button onClick={onClick}>Do Something</Button>}
                </Confirm>

                <Checkbox
                    label="Enable confirmation?"
                    checked={confirmEnabled}
                    onChange={handleChangeConfirmEnabled}
                    className="m-l-4"
                />
            </Stack>

            <Text size={4} className="m-t-4 m-b-half">
                (Yes / No / Cancel) confrimation
            </Text>
            <Confirm
                title="Save current progress?"
                onConfirm={handleConfirm}
                onDecline={handleDecline}
                confirmation={YesNoConfirmation}
            >
                {onClick => <Button onClick={onClick}>Do Something</Button>}
            </Confirm>

            <Text size={4} className="m-t-4 m-b-half">
                Custom confirmation component
            </Text>
            <Confirm
                title="Builder will be closed"
                message="Do you want to save your changes?"
                details="(Your progress will be removed permanently)"
                onConfirm={handleConfirm}
                onDecline={handleDecline}
                confirmation={CustomConfirmation}
            >
                {onClick => <Button onClick={onClick}>Do Something</Button>}
            </Confirm>
        </React.Fragment>
    );
};
