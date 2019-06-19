import * as React from 'react';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';

import {
    ComboBox,
    ComboBoxChangeEvent,
    ComboBoxFilterChangeEvent,
    DropDownList,
    DropDownListChangeEvent,
    DropDownListFilterChangeEvent,
    DropDownListProps,
    ComboBoxProps
} from '@progress/kendo-react-dropdowns';
import { filterBy, FilterDescriptor } from '@progress/kendo-data-query';
import { GridFilterCell, GridFilterCellProps } from '@progress/kendo-react-grid';

export enum ControlType {
    ComboBox,
    Dropdown
}

export function selectFilter<T>(
    data: T[],
    controlType: ControlType = ControlType.ComboBox,
): React.ComponentClass<GridFilterCellProps> {
    @observer
    class SelectFilter extends GridFilterCell {
        @observable private filter?: FilterDescriptor;

        @computed get data() {
            if (this.filter) {
                return filterBy(data, this.filter);
            } else {
                return data;
            }
        }

        @action
        handleChange = (ev: ComboBoxChangeEvent | DropDownListChangeEvent) => {
            const value = ev.target.value;

            this.props.onChange({
                value,
                operator: value ? 'eq' : '',
                syntheticEvent: ev.syntheticEvent
            });
        }

        @action
        handleFilterChange = (ev: ComboBoxFilterChangeEvent | DropDownListFilterChangeEvent) => {
            this.filter = ev.filter;
        }

        private getControl(type: ControlType): React.ComponentClass<ComboBoxProps> | React.ComponentClass<DropDownListProps> {
            switch (type) {
                case ControlType.ComboBox: return ComboBox;
                case ControlType.Dropdown: return DropDownList;
            }
        }

        render() {
            const Control = this.getControl(controlType);

            return (
                <Control
                    data={this.data}
                    value={this.props.value}
                    onChange={this.handleChange}
                    filterable={true}
                    onFilterChange={this.handleFilterChange}
                />
            );
        }
    }

    return SelectFilter;
}
