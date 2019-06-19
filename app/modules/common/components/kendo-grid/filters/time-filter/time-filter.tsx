import * as React from 'react';

import { observer } from 'mobx-react';
import { observable, action } from 'mobx';

import { GridColumnMenuFilterUIProps } from '@progress/kendo-react-grid/dist/npm/interfaces/GridColumnMenuFilterUIProps';

import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { TimePicker, TimePickerChangeEvent } from '@progress/kendo-react-dateinputs';

import { renderCustomColumnMenuFilter } from '../column-menu-filters';

@observer
class TimeFilter extends React.Component<GridColumnMenuFilterUIProps> {
    @observable operator = this.props.operators.find(
        o => o.operator === this.props.firstFilterProps.operator
    ) || this.props.operators[0];

    handleChange = (event: TimePickerChangeEvent) => {
        const value = event.value;

        this.props.firstFilterProps.onChange({
            value: value ? new Date(2000, 0, 1, value.getHours(), value.getMinutes()) : null,
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
                <TimePicker value={this.props.firstFilterProps.value} onChange={this.handleChange} />
            </React.Fragment>
        );
    }
}

export const TimeColumnMenuFilter = renderCustomColumnMenuFilter(TimeFilter);
