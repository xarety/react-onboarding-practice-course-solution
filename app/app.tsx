import * as React from 'react';
import { HashRouter } from 'react-router-dom';

import { Stack, Text } from '@servicetitan/design-system';

import { getUserConfirmation } from './modules/common/components/confirm-navigation/confirm-navigation';

export const App: React.FC = () => (
    <HashRouter getUserConfirmation={getUserConfirmation}>
        <Stack alignItems="center" justifyContent="center" className="flex-auto">
            <Text size={5}>React Onboarding Practice Course Template</Text>
        </Stack>
    </HashRouter>
);
