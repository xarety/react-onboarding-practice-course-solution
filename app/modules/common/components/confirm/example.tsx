import * as React from 'react';

import { ButtonGroup, Button, Text, Modal } from '@servicetitan/design-system';

import { Confirm, ConfirmationProps } from './confirm';

const CustomConfirmation: React.FC<ConfirmationProps> = ({ onConfirm, onCancel }) => (
    <Modal
        open
        closable
        onClose={onCancel}
        size={Modal.Sizes.XS}
        title="It's custom confirmation"
        footer={
            <ButtonGroup>
                <Button onClick={onCancel}>
                    Cancel
                </Button>

                <Button primary onClick={onConfirm}>
                    Confirm
                </Button>
            </ButtonGroup>
        }
    >
        Are you sure?
    </Modal>
);

export const Example: React.FC = () => {
    const [lastAction, setLastAction] = React.useState('');

    const handleActionClick = (actionType: string) => () => {
        setLastAction(actionType);
    };

    return (
        <React.Fragment>
            <Text className="m-b-2">
                Last completed action: {lastAction}
            </Text>

            <ButtonGroup>
                <Button onClick={handleActionClick('Action')}>
                    Action
                </Button>

                <Confirm onClick={handleActionClick('Action with confirmation')}>
                    {onClick => (
                        <Button
                            primary
                            onClick={onClick}
                        >
                            Action With Confirmation
                        </Button>
                    )}
                </Confirm>

                <Confirm
                    onClick={handleActionClick('Action with custom confirmation')}
                    confirmation={CustomConfirmation}
                >
                    {onClick => (
                        <Button
                            negative
                            onClick={onClick}
                        >
                            Action With Custom Confirmation
                        </Button>
                    )}
                </Confirm>
            </ButtonGroup>
        </React.Fragment>
    );
};
