import * as React from 'react';

import { Radio } from '@servicetitan/design-system';

import { GridFilterCell } from '@progress/kendo-react-grid';

import * as Styles from './boolean-filter.less';

export class BooleanFilter extends GridFilterCell {
    handleChange = (value: boolean, event: React.FormEvent<HTMLInputElement>) => {
        this.props.onChange({
            value,
            operator: 'eq',
            syntheticEvent: event
        });
    };

    handleClear = (event: React.MouseEvent) => {
        this.props.onChange({
            value: null,
            operator: '',
            syntheticEvent: event
        });
    };

    render() {
        return (
            <div className={Styles.booleanFilter}>
                <Radio
                    label="True"
                    value={true}
                    checked={this.props.value === true}
                    onChange={this.handleChange}
                />
                <Radio
                    label="False"
                    value={false}
                    checked={this.props.value === false}
                    onChange={this.handleChange}
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
