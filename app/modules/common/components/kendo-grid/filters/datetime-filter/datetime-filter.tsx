import * as React from 'react';

import { observer } from 'mobx-react';
import { observable, action } from 'mobx';

import { GridFilterCell } from '@progress/kendo-react-grid';
import { GridColumnMenuFilterUIProps } from '@progress/kendo-react-grid/dist/npm/interfaces/GridColumnMenuFilterUIProps';

import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { DatePicker, DatePickerChangeEvent, TimePicker, TimePickerChangeEvent } from '@progress/kendo-react-dateinputs';

import { renderCustomColumnMenuFilter } from '../column-menu-filters';

import * as Styles from './datetime-filter.less';

export class DatetimeFilter extends GridFilterCell {
    handleChange = (event: DatePickerChangeEvent | TimePickerChangeEvent) => {
        const value = event.value;

        this.props.onChange({
            value,
            operator: value ? 'eq' : '',
            syntheticEvent: event.syntheticEvent
        });
    }

    handleClear = (event: React.MouseEvent) => {
        this.props.onChange({
            value: null,
            operator: '',
            syntheticEvent: event
        });
    }

    render() {
        return (
            <div className={Styles.datetimeFilter}>
                <DatePicker value={this.props.value} onChange={this.handleChange} className="m-r-1" />
                <TimePicker value={this.props.value} onChange={this.handleChange} className="m-r-1" />

                <button
                    className="k-button k-button-icon k-clear-button-visible"
                    title="Clear"
                    disabled={this.props.value === null}
                    onClick={this.handleClear}
                >
                    <span className="k-icon k-i-filter-clear" />
                </button>
            </div>
        );

    }
}

@observer
class DateTimeFilterUI extends React.Component<GridColumnMenuFilterUIProps> {
    @observable operator = this.props.operators.find(
        o => o.operator === this.props.firstFilterProps.operator
    ) || this.props.operators[0];

    handleChange = (event: DatePickerChangeEvent | TimePickerChangeEvent) => {
        const value = event.value;

        this.props.firstFilterProps.onChange({
            value,
            operator: this.props.firstFilterProps.operator,
            syntheticEvent: event.syntheticEvent
        });
    }

    @action
    handleOperatorChange = (event: DropDownListChangeEvent) => {
        this.operator = event.target.value;

        this.props.firstFilterProps.onChange({
            value: this.props.firstFilterProps.value,
            operator: this.operator.operator,
            syntheticEvent: event.syntheticEvent
        });
    }

    render() {
        return (
            <React.Fragment>
                <DropDownList
                    value={this.operator}
                    onChange={this.handleOperatorChange}
                    data={this.props.operators}
                    dataItemKey="operator"
                    textField="text"
                />
                <DatePicker value={this.props.firstFilterProps.value} onChange={this.handleChange} />
                <TimePicker value={this.props.firstFilterProps.value} onChange={this.handleChange} />
            </React.Fragment>
        );
    }
}

export const DateTimeColumnMenuFilter = renderCustomColumnMenuFilter(DateTimeFilterUI);
