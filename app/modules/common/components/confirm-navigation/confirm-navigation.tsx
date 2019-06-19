import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from '@servicetitan/design-system';
import { Modal } from 'semantic-ui-react';
import { observer } from 'mobx-react';

import * as Styles from './confirm-navigation.less';

interface ConfirmNavigationProps {
    onCancel: () => void;
    onConfirm: () => void;
}

const ConfirmNavigation = observer<React.FC<ConfirmNavigationProps>>(({
    onCancel,
    onConfirm
}) => {
    return (
        <Modal
            open={true}
            closeOnDimmerClick
            className={Styles.confirmNav}
            onClose={onCancel}
        >
            <Modal.Content>
                <div className={Styles.header}>
                    Are you sure you want to leave?
                </div>
                <div className={Styles.description}>
                    You'll lose all your changes if you do.
                </div>
                <div className={Styles.buttons}>
                    <Button outline onClick={onCancel}>Stay</Button>
                    <Button negative onClick={onConfirm}>Leave</Button>
                </div>
            </Modal.Content>
        </Modal>
    );
});

/** Override default behavior which invokes window.confirm
 *  idea from https://gist.github.com/robertgonzales/e54699212da497740845712f3648d98c
 *  author: @robertgonazles
 *  @param currPathname current pathname, used to restore url when navigating to routes that handle sammy.js before react-router. eg. /#/Settings
 *  @param callback call callback(true) to continue the transiton, or callback(false) to abort it.
 */
export function getUserConfirmation(currPathname: string, callback: (ok: boolean) => void) {
    const modal = document.createElement('div');
    document.body.appendChild(modal);

    ReactDOM.render(
        <ConfirmNavigation
            onCancel={withCleanup(false, modal, callback, currPathname)}
            onConfirm={withCleanup(true, modal, callback)}
        />,
        modal
    );
}

function withCleanup(answer: boolean, modal: HTMLDivElement, callback: (ok: boolean) => void, currPathname?: string) {
    return () => {
        ReactDOM.unmountComponentAtNode(modal);
        document.body.removeChild(modal);
        if (currPathname) {
            window.location.replace(`#${currPathname}`);
        }
        callback(answer);
    };
}
