import * as React from 'react';

import { Checkbox } from '@servicetitan/design-system';
import { CheckboxProps } from 'semantic-ui-react';

import { GridFilterCell } from '@progress/kendo-react-grid';

import * as Styles from './boolean-filter.less';

export class BooleanFilter extends GridFilterCell {
    handleChange = (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        const value = !!data.value;

        this.props.onChange({
            value,
            operator: 'eq',
            syntheticEvent: event
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
            <div className={Styles.booleanFilter}>
                <Checkbox
                    label="True"
                    value={1}
                    checked={this.props.value === true}
                    onChange={this.handleChange}
                    radio
                />
                <Checkbox
                    label="False"
                    value={0}
                    checked={this.props.value === false}
                    onChange={this.handleChange}
                    radio
                />

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
