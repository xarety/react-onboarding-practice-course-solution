import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { provide, useDependencies } from '@servicetitan/react-ioc';

import { observer } from 'mobx-react-lite';

import { Text, Form, Link, ButtonGroup, Button } from '@servicetitan/design-system';

import { UserRole } from '../../../common/api/auth.api';

import { RegisterStore } from '../stores/register.store';

import { enumToOptions } from '../../../common/utils/form-helpers';

import { Label } from '../../../common/components/label/label';

const rolesOptions = enumToOptions(UserRole);

export const Register: React.FC<RouteComponentProps> = provide({ singletons: [RegisterStore] })(observer(
    ({ history }) => {
        const [registerStore] = useDependencies(RegisterStore);

        const { form: { $: { login, passwords, role } } } = registerStore;
        const { $: { password, passwordConfirmation } } = passwords;

        const handleSubmit = async () => {
            const isSuccessful = await registerStore.register();

            if (isSuccessful) {
                history.push('/login');
            }
        };

        return (
            <Form onSubmit={handleSubmit}>
                <Text el="div" className="m-b-4 ta-center" size={4}>
                    Register
                </Text>

                <Form.Input
                    label={
                        <Label
                            label="Login"
                            hasError={login.hasError}
                            error={login.error}
                        />
                    }
                    value={login.value}
                    onChange={login.onChangeHandler}
                    error={login.hasError}
                />

                <Form.Input
                    label={
                        <Label
                            label="Password"
                            hasError={passwords.hasError}
                            error={passwords.error || undefined}
                        />
                    }
                    value={password.value}
                    onChange={password.onChangeHandler}
                    error={passwords.hasError}
                    type="password"
                />

                <Form.Input
                    label={
                        <Label
                            label="Password Confirmation"
                            hasError={passwords.hasFormError}
                        />
                    }
                    value={passwordConfirmation.value}
                    onChange={passwordConfirmation.onChangeHandler}
                    error={passwords.hasFormError}
                    type="password"
                />

                <Form.Select
                    label="Role"
                    value={role.value}
                    onChange={role.onChangeHandler}
                    options={rolesOptions}
                />

                <ButtonGroup fullWidth>
                    <Link href="#/login" primary text>
                        Sign In
                    </Link>

                    <Button full primary type="submit">
                        Create
                    </Button>
                </ButtonGroup>
            </Form>
        );
    }
));
