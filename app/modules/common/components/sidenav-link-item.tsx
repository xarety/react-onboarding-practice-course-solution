import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { SideNav } from '@servicetitan/design-system';

interface SideNavLinkItemProps extends RouteComponentProps<void> {
    className?: string;
    exact?: boolean;
    pathname: string;
}

const SideNavLinkItemUnwrapped: React.FC<SideNavLinkItemProps> = ({
    className,
    pathname,
    exact,
    history,
    ...props
}) => {
    const gotoLink = () => history.push(pathname);
    return (
        <SideNav.Item
            className={className}
            onClick={gotoLink}
            active={
                exact
                    ? history.location.pathname === pathname
                    : history.location.pathname.startsWith(pathname)
            }
        >
            {props.children}
        </SideNav.Item>
    );
};

export const SideNavLinkItem = withRouter(SideNavLinkItemUnwrapped);
