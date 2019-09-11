import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';

import { observable, action, runInAction, comparer } from 'mobx';
import { observer } from 'mobx-react';

import { Location, UnregisterCallback } from 'history';

import { Dialog } from '@servicetitan/design-system';

declare global {
    interface Window {
        App: any;
    }
}

interface ConfirmNavigationProps extends RouteComponentProps<{}> {
    when?: boolean;
}

@observer
class ConfirmNavigationUnwrapped extends React.Component<RouteComponentProps<{}>> {
    @observable isOpen = false;

    isRedirecting = false;

    currentLocation?: Location;
    targetLocation?: Location;

    componentDidMount() {
        this.block();

        if (window.App && window.App.Instance && window.App.Instance.before) {
            window.App.Instance.before(this.onBefore);
        }
    }

    componentDidUpdate(prevProps: RouteComponentProps<{}>) {
        const { history: prevHistory } = prevProps;
        const { history } = this.props;

        if (!comparer.structural(prevHistory.location, history.location)) {
            this.unblock();
            this.block();
        }
    }

    componentWillUnmount() {
        this.unblock();

        if (window.App && window.App.Instance && window.App.Instance.befores) {
            window.App.Instance.befores = window.App.Instance.befores.filter(
                ([, callback]: [any, Function]) => callback !== this.onBefore
            );
        }
    }

    // We should terminate Sammy navigation and fix URL of the current page
    onBefore = () => {
        if (this.isOpen && this.currentLocation) {
            this.isRedirecting = true;
            window.App.Instance.setLocation('#' + this.currentLocation.pathname);
        }

        return !this.isOpen;
    };

    block = () => {
        const { history } = this.props;

        this.unblock = history.block(targetLocation => {
            // We shouldn't memorize new locations if it is navigation just for fix URL of the current page
            if (this.isRedirecting) {
                this.isRedirecting = false;
                return false;
            }

            const hasChanged =
                history.location.pathname !== targetLocation.pathname ||
                history.location.search !== targetLocation.search;

            if (hasChanged) {
                runInAction(() => {
                    this.isOpen = true;
                    this.targetLocation = targetLocation;
                    this.currentLocation = history.location;
                });

                return false;
            }
        });
    };

    unblock!: UnregisterCallback;

    handleConfirm = () => {
        if (!this.currentLocation || !this.targetLocation) {
            return;
        }

        const currentLocation = this.currentLocation;
        const targetLocation = this.targetLocation;

        this.reset();

        this.unblock();
        // Fixing URL of the current page if it was changed manually
        this.props.history.replace(currentLocation);
        this.props.history.push(targetLocation);
    };

    handleCancel = () => {
        if (!this.currentLocation) {
            return;
        }

        const currentLocation = this.currentLocation;

        this.reset();

        this.unblock();
        // Fixing URL of the current page if it was changed manually
        this.props.history.replace(currentLocation);
        this.block();
    };

    @action
    reset() {
        this.isOpen = false;
        this.isRedirecting = false;
        this.currentLocation = undefined;
        this.targetLocation = undefined;
    }

    render() {
        return (
            <Dialog
                closable
                negative
                open={this.isOpen}
                onClose={this.handleCancel}
                title="Do you want to leave?"
                onPrimaryActionClick={this.handleConfirm}
                primaryActionName="Leave"
                onSecondaryActionClick={this.handleCancel}
                secondaryActionName="Stay"
            >
                You'll lose all your changes if you do.
            </Dialog>
        );
    }
}

export const ConfirmNavigation = withRouter(({ when = true, ...props }: ConfirmNavigationProps) =>
    when ? <ConfirmNavigationUnwrapped {...props} /> : null
);
