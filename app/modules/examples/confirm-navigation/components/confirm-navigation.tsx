import * as React from 'react';

import { Checkbox } from '@servicetitan/design-system';

import { ConfirmNavigation } from '../../../common/components/confirm-navigation';

export const ConfirmNavigationExample: React.FC = () => {
    const [confirm, setConfirm] = React.useState(true);

    const handleChange = (_0: never, checked: boolean) => {
        setConfirm(checked);
    };

    return (
        <React.Fragment>
            <Checkbox label="Confirm Navigation?" checked={confirm} onChange={handleChange} />

            <ConfirmNavigation when={confirm} />
        </React.Fragment>
    );
};
