import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { useDependencies, provide } from '@servicetitan/react-ioc';

import { observer } from 'mobx-react-lite';

import { Text, Form, Link, ButtonGroup, Button, Banner } from '@servicetitan/design-system';

import { LoginStore } from '../stores/login.store';

export const Login: React.FC<RouteComponentProps> = provide({ singletons: [LoginStore] })(observer(
    ({ history }) => {
        const [loginStore] = useDependencies(LoginStore);

        const { form, isDirty, error } = loginStore;
        const { $: { login, password } } = form;

        const handleSubmit = async () => {
            const isSuccessful = await loginStore.login();

            if (isSuccessful) {
                history.push('/');
            }
        };

        return (
            <Form onSubmit={handleSubmit}>
                <Text el="div" className="m-b-4 ta-center" size={4}>
                    Login
                </Text>

                {error && (
                    <Banner
                        status="critical"
                        title={error}
                        className="m-b-3"
                    />
                )}

                <Form.Input
                    label="Login"
                    value={login.value}
                    onChange={login.onChangeHandler}
                    error={login.hasError}
                />

                <Form.Input
                    label="Password"
                    value={password.value}
                    onChange={password.onChangeHandler}
                    error={password.hasError}
                    type="password"
                />

                <ButtonGroup fullWidth>
                    <Link href="#/register" primary text>
                        Sign Up
                    </Link>

                    <Button full primary type="submit" disabled={!isDirty || form.hasError}>
                        Login
                    </Button>
                </ButtonGroup>
            </Form>
        );
    }
));
