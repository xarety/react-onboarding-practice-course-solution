import * as React from 'react';

import { Modal, ButtonGroup, Button } from '@servicetitan/design-system';

import { ConfirmationProps } from '../use-confirm';

import * as classNames from 'classnames';
import * as Styles from './yes-no-confirmation.less';

// TODO: think about suitable default title
export const YesNoConfirmation: React.FC<ConfirmationProps> = ({
    title = '',
    message = '',
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
                <Button onClick={onCancel}>Cancel</Button>
                <Button negative onClick={onDecline}>
                    No
                </Button>
                <Button primary onClick={onConfirm}>
                    Yes
                </Button>
            </ButtonGroup>
        }
        className={classNames(Styles.yesNoConfirmation, !message && Styles.withoutMessage)}
    >
        {message}
    </Modal>
);
