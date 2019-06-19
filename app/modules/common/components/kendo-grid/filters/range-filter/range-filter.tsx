import * as React from 'react';
import { DatePicker, TimePicker } from '@progress/kendo-react-dateinputs';
import { GridColumnMenuFilterUIProps } from '@progress/kendo-react-grid/dist/npm/interfaces/GridColumnMenuFilterUIProps';
import { GridFilterCell, GridFilterCellProps } from '@progress/kendo-react-grid';
import { NumericTextBox, NumericTextBoxProps } from '@progress/kendo-react-inputs';
import * as moment from 'moment';

import { renderCustomColumnMenuFilter } from '../column-menu-filters';

import * as Styles from './range-filter.less';

// TODO: remove when Kendo fix the propType bug of DatePicker
interface ComponentClassWithBrokenPropTypes<P = {}, S = React.ComponentState> extends React.StaticLifecycle<P, S> {
    new(props: P, context?: any): React.Component<P, S>;
    propTypes?: any;
    contextTypes?: React.ValidationMap<any>;
    childContextTypes?: React.ValidationMap<any>;
    defaultProps?: any;
    displayName?: string;
}

interface Range<T> {
    min: T;
    max: T;
}

interface BaseControlProps<T> {
    value?: T | null;
    width?: number | string;
    onChange?: (ev: any) => void;
}

// TODO: get rid of `| void` after upgrade to TS 3.2
type RangeControlProps<T, TProps> = BaseControlProps<T> & (TProps | void);

type RangeControl<T, TProps> = React.Component<RangeControlProps<T, TProps>> & { value: T | null };

/**
 * Base class for range filter for Kendo Grid.
 * @type T The type for input values, eg. number, Date, etc.
 */
export abstract class RangeFilterBase<T, TProps = void> extends GridFilterCell {
    private minValueBox: RangeControl<T, TProps> | null = null;
    private maxValueBox: RangeControl<T, TProps> | null = null;

    constructor(
        props: GridFilterCellProps,
        private controlClass: ComponentClassWithBrokenPropTypes<RangeControlProps<T, TProps>>,
        private controlProps: TProps = {} as any
    ) {
        super(props);
    }

    /** override this if additional type support needed */
    inRange(current: T, values: Range<T>) {
        return (values.min === null || current >= values.min)
            && (values.max === null || current <= values.max);
    }

    protected onChange = (ev: any) => {
        if (!this.minValueBox || !this.maxValueBox) { return; }
        this.props.onChange({
            value: { min: this.minValueBox.value, max: this.maxValueBox.value },
            operator: this.inRange,
            syntheticEvent: ev.syntheticEvent
        });
    }

    protected setMinValueRef = (el: RangeControl<T, TProps> | null) => {
        this.minValueBox = el;
    }

    protected setMaxValueRef = (el: RangeControl<T, TProps> | null) => {
        this.maxValueBox = el;
    }

    protected onClear = (ev: React.SyntheticEvent) => {
        ev.preventDefault();
        this.props.onChange({
            value: null,
            operator: '',
            syntheticEvent: ev
        });
    }

    render() {
        const filterValue = this.props.value;
        const Control = this.controlClass;
        return (
            <React.Fragment>
                From:
                <span className={Styles.rangeMin}>
                    <Control
                        {...this.controlProps}
                        width="100px"
                        value={filterValue && filterValue.min}
                        ref={this.setMinValueRef}
                        onChange={this.onChange}
                    />
                </span>
                To:
                <span className={Styles.rangeMax}>
                    <Control
                        {...this.controlProps}
                        width="100px"
                        value={filterValue && filterValue.max}
                        ref={this.setMaxValueRef}
                        onChange={this.onChange}
                    />
                </span>
                <button
                    className="k-button k-button-icon k-clear-button-visible"
                    title="Clear"
                    disabled={!filterValue}
                    onClick={this.onClear}
                >
                    <span className="k-icon k-i-filter-clear" />
                </button>
            </React.Fragment>
        );
    }
}

export class NumericRangeFilter extends RangeFilterBase<number> {
    constructor(props: GridFilterCellProps) {
        super(props, NumericTextBox);
    }
}

export class CurrencyRangeFilter extends RangeFilterBase<number, NumericTextBoxProps> {
    constructor(props: GridFilterCellProps) {
        super(props, NumericTextBox, {
            format: 'c'
        });
    }
}

export class DateRangeFilter extends RangeFilterBase<Date> {
    constructor(props: GridFilterCellProps) {
        super(props, DatePicker);
    }
}

export class TimeRangeFilter extends RangeFilterBase<Date> {
    inRange(current: Date, values: Range<Date>) {

        function getTimeString(date: Date) {            
            return `${date.getHours()}:${date.getMinutes()}`;
        }

        return moment(getTimeString(current), 'h:mma').isBetween(
            moment(getTimeString(values.min || current), 'h:mma'),
            moment(getTimeString(values.max || current), 'h:mma'),
            'minutes',
            '[]'
        );
    }

    constructor(props: GridFilterCellProps) {
        super(props, TimePicker);
    }
}

class RangeFilterUIBase<T, TProps = void> extends React.Component<GridColumnMenuFilterUIProps> {
    private minValueBox: RangeControl<T, TProps> | null = null;
    private maxValueBox: RangeControl<T, TProps> | null = null;

    constructor(
        props: GridColumnMenuFilterUIProps,
        private controlClass: ComponentClassWithBrokenPropTypes<RangeControlProps<T, TProps>>,
        private controlProps: TProps = {} as any
    ) {
        super(props);
    }

    /** override this if additional type support needed */
    inRange(current: T, values: Range<T>) {
        return (values.min === null || current >= values.min)
            && (values.max === null || current <= values.max);
    }

    onChange = (ev: any) => {
        if (!this.minValueBox || !this.maxValueBox) { return; }
        this.props.firstFilterProps.onChange({
            value: { min: this.minValueBox.value, max: this.maxValueBox.value },
            operator: this.inRange,
            syntheticEvent: ev.syntheticEvent
        });
    }

    protected setMinValueRef = (el: RangeControl<T, TProps> | null) => {
        this.minValueBox = el;
    }

    protected setMaxValueRef = (el: RangeControl<T, TProps> | null) => {
        this.maxValueBox = el;
    }

    render() {
        const filterValue = this.props.firstFilterProps.value;
        const Control = this.controlClass;
        return (
            <React.Fragment>
                <span>From:</span>
                <span className={Styles.from} >
                    <Control
                        {...this.controlProps}
                        value={filterValue && filterValue.min}
                        ref={this.setMinValueRef}
                        onChange={this.onChange}
                    />
                </span>
                <span>To:</span>
                <span className={Styles.to}>
                    <Control
                        {...this.controlProps}
                        value={filterValue && filterValue.max}
                        ref={this.setMaxValueRef}
                        onChange={this.onChange}
                    />
                </span>
            </React.Fragment >
        );
    }
}

class NumericRangeFilterUI extends RangeFilterUIBase<number> {
    constructor(props: GridColumnMenuFilterUIProps) {
        super(props, NumericTextBox);
    }
}

class CurrencyRangeFilterUI extends RangeFilterUIBase<number, NumericTextBoxProps> {
    constructor(props: GridColumnMenuFilterUIProps) {
        super(props, NumericTextBox, {
            format: 'c'
        });
    }
}

class DateRangeFilterUI extends RangeFilterUIBase<Date> {
    constructor(props: GridColumnMenuFilterUIProps) {
        super(props, DatePicker);
    }
}

function getTimeString(date: Date) {
    return `${date.getHours()}:${date.getMinutes()}`;
}

class TimeRangeFilterUI extends RangeFilterUIBase<Date> {
    inRange(current: Date, values: Range<Date>) {
        return moment(getTimeString(current), 'h:mma').isBetween(
            moment(getTimeString(values.min || current), 'h:mma'),
            moment(getTimeString(values.max || current), 'h:mma'),
            'minutes',
            '[]'
        );
    }

    constructor(props: GridColumnMenuFilterUIProps) {
        super(props, TimePicker);
    }
}

export const NumericRangeColumnMenuFilter = renderCustomColumnMenuFilter(NumericRangeFilterUI);
export const CurrencyRangeColumnMenuFilter = renderCustomColumnMenuFilter(CurrencyRangeFilterUI);
export const DateRangeColumnMenuFilter = renderCustomColumnMenuFilter(DateRangeFilterUI);
export const TimeRangeColumnMenuFilter = renderCustomColumnMenuFilter(TimeRangeFilterUI);
