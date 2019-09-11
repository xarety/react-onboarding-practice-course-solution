import * as React from 'react';

import { useDependencies } from '@servicetitan/react-ioc';

import { SideNav } from '@servicetitan/design-system';

import { AuthStore } from '../stores/auth.store';

import { SideNavLinkItem } from './sidenav-link-item';

interface MenuProps {
    className?: string;
}

export const Menu: React.FC<MenuProps> = ({ className }) => {
    const [authStore] = useDependencies(AuthStore);

    const handleLogout = () => {
        authStore.logout();
    };

    return (
        <SideNav
            title="React Onboarding Practice Course"
            className={className}
            style={{ width: 240 }}
        >
            <SideNavLinkItem pathname="/users">Users</SideNavLinkItem>

            <SideNavLinkItem pathname="/news-feed" className="m-b-4">
                News Feed
            </SideNavLinkItem>

            <SideNav.Item onClick={handleLogout}>Logout</SideNav.Item>
        </SideNav>
    );
};
