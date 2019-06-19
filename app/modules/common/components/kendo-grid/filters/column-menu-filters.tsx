import * as React from 'react';
import { GridColumnMenuFilter, GridColumnMenuProps } from '@progress/kendo-react-grid';
import { GridColumnMenuFilterUIProps } from '@progress/kendo-react-grid/dist/npm/interfaces/GridColumnMenuFilterUIProps';

export const StandardColumnMenuFilter = (props: GridColumnMenuProps) => (
    <GridColumnMenuFilter {...props} expanded />
);

export function renderCustomColumnMenuFilter(
    filterUI: React.ComponentType<GridColumnMenuFilterUIProps>
) {
    return (props: GridColumnMenuProps) => (
        <GridColumnMenuFilter
            {...props}
            filterUI={filterUI}
            expanded
            hideSecondFilter
        />
    );
}
