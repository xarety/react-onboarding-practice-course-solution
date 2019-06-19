import * as classNames from 'classnames';
import * as React from 'react';
import { Stack, Icon, Text, Tooltip } from '@servicetitan/design-system';

import * as Styles from './label.less';

type Direction =
    | 'top' | 't'
    | 'right' | 'r'
    | 'bottom' | 'b'
    | 'left' | 'l'
    | 'topleft' | 'tl'
    | 'topright' | 'tr'
    | 'bottomleft' | 'bl'
    | 'bottomright' | 'br'
    ;

interface LabelProps {
    label: string;
    tooltip?: string;
    tooltipDirection?: Direction;
    hasError?: boolean;
    error?: string;
}

export const Label: React.FC<LabelProps> = ({
    label,
    tooltip,
    tooltipDirection = 'r',
    hasError,
    error,
}) => (
    <div
        className={classNames(
            Styles.label,
            hasError && Styles.hasError,
        )}
    >
        <Stack className={Styles.text}>
            <Stack.Item>{label}</Stack.Item>
            {tooltip && (
                <Stack.Item className={Styles.tooltip}>
                    <Tooltip direction={tooltipDirection} text={tooltip}>
                        <Icon name="info" size={13} />
                    </Tooltip>
                </Stack.Item>
            )}
        </Stack>
        {hasError && (
            <Text className={Styles.error} size={1}>{error}</Text>
        )}
    </div>
);
