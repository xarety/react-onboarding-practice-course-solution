import * as React from 'react';

import { Modal, ButtonGroup, Button, Text } from '@servicetitan/design-system';

import { ConfirmationProps } from '../../../common/components/confirm';

interface CustomConfirmationProps extends ConfirmationProps {
    details?: string;
}

export const CustomConfirmation: React.FC<CustomConfirmationProps> = ({
    title,
    message,
    details,
    onConfirm,
    onDecline,
    onCancel
}) => (
    <Modal
        open
        closable
        onClose={onCancel}
        size={Modal.Sizes.S}
        title={title}
        footer={
            <ButtonGroup>
                <Button outline onClick={onCancel}>
                    Continue working
                </Button>

                <Button outline negative onClick={onDecline}>
                    No, thanks
                </Button>

                <Button outline primary onClick={onConfirm}>
                    Sure, let's do it
                </Button>
            </ButtonGroup>
        }
    >
        <Text size={3}>{message}</Text>
        <Text size={2} subdued>
            {details}
        </Text>
    </Modal>
);
