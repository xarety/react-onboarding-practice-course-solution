import * as React from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';

import { provide, useDependencies } from '@servicetitan/react-ioc';

import { observer } from 'mobx-react';

import { Stack } from '@servicetitan/design-system';

import { AuthApi } from './modules/common/api/auth.api';

import { AuthStore } from './modules/common/stores/auth.store';

import { AuthRouter } from './modules/auth/components/auth-router';
import { Menu } from './modules/common/components/menu';
import { NewsFeed } from './modules/news-feed/components/news-feed';
import { ManageUsers } from './modules/manage-users/components/manage-users';

export const App: React.FC = provide({ singletons: [AuthApi, AuthStore] })(
    observer(() => {
        const [{ isAuthenticated }] = useDependencies(AuthStore);

        return (
            <React.StrictMode>
                <HashRouter>
                    <Stack className="flex-auto">
                        {!isAuthenticated ? (
                            <AuthRouter />
                        ) : (
                            <React.Fragment>
                                <Menu className="flex-none" />

                                <Stack.Item fill className="d-f flex-column of-auto">
                                    <Switch>
                                        <Route path="/users" component={ManageUsers} />
                                        <Route path="/news-feed" component={NewsFeed} />

                                        <Redirect from="/*" to="/users" />
                                    </Switch>
                                </Stack.Item>
                            </React.Fragment>
                        )}
                    </Stack>
                </HashRouter>
            </React.StrictMode>
        );
    })
);
