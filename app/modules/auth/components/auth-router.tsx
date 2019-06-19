import * as React from 'react';
import { Route, Switch, Redirect } from 'react-router';

import { Stack } from '@servicetitan/design-system';

import { Login } from '../login/components/login';
import { Register } from '../register/components/register';

export const AuthRouter: React.FC = () => (
    <Stack alignItems="center" justifyContent="center" className="flex-auto">
        <div style={{ width: 300 }}>
            <Switch>
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />

                <Redirect from="/*" to="/login" />
            </Switch>
        </div>
    </Stack>
);
