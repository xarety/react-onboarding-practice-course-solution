import { GridFilterCellProps } from '@progress/kendo-react-grid';
import * as React from 'react';

import { observer } from 'mobx-react';
import { observable, computed, Lambda, runInAction, observe, toJS, action } from 'mobx';

import { Checkbox, Link } from '@servicetitan/design-system';

import { Input } from '@progress/kendo-react-inputs';
import { filterBy } from '@progress/kendo-data-query';
import { GridColumnMenuFilterUIProps } from '@progress/kendo-react-grid/dist/npm/interfaces/GridColumnMenuFilterUIProps';
import { ListItemProps, MultiSelectTagData } from '@progress/kendo-react-dropdowns';

import { DataSource } from '../../data-sources';
import { KendoGridState } from '../../kendo-grid-state';
import { MultiSelectFilterBase } from '../multiselect-filter/multiselect-filter';
import { renderCustomColumnMenuFilter } from '../column-menu-filters';

import * as Styles from './field-values-filter.less';

export function operator<T>(item: T, value: T[]) {
    return value.includes(item);
}

export function fieldValuesFilter<T>(
    gridState: KendoGridState<T>,
    itemRender?: (li: React.ReactElement<any>, itemProps: ListItemProps) => React.ReactNode
): React.ComponentClass<GridFilterCellProps> {
    @observer
    class FieldValuesFilter extends MultiSelectFilterBase<T[keyof T]> {
        @observable data: T[keyof T][] = [];

        @computed get filteredData() {
            return this.filter ? filterBy(this.data, toJS(this.filter)) : this.data;
        }

        private disposer?: Lambda;

        componentDidMount() {
            this.disposer = observe(gridState, 'dataSource', async change => {
                const dataSource = change.newValue;

                const items = dataSource ? ((await dataSource.getData({})).data as T[]) : [];

                const values = items.map(v => v[this.props.field! as keyof T]);

                const distinctValues = values.filter((v, idx) => values.indexOf(v) === idx).sort();

                runInAction(() => {
                    this.data = distinctValues;
                });
            });
        }

        componentWillUnmount() {
            if (this.disposer) {
                this.disposer();
            }
        }

        private get tags() {
            return this.value.length > 0
                ? [{ text: `${this.value.length} selected`, data: [...this.value] }]
                : [];
        }

        private tagRender = (tagData: MultiSelectTagData) => {
            return (
                <li key="items-selected" className={Styles.tag}>
                    {tagData.text}
                </li>
            );
        };

        @action
        handleHeaderClick = (ev: React.MouseEvent) => {
            for (const value of this.filteredData) {
                if (this.value.indexOf(value) === -1) {
                    this.value.push(value);
                }
            }

            const hasValue = this.value.length > 0;
            this.props.onChange({
                value: hasValue ? this.value : '',
                operator: hasValue ? operator : '',
                syntheticEvent: ev
            });
        };

        private getHeader() {
            return this.filteredData.length ? (
                <li key="header" className={Styles.fieldValuesFilterHeader}>
                    <Link primary onClick={this.handleHeaderClick}>
                        Select all {this.filter && this.filter.value && `"${this.filter.value}"`}
                    </Link>
                </li>
            ) : (
                undefined
            );
        }

        render() {
            return this.renderWithData({
                itemRender,
                data: [...this.filteredData],
                tags: this.tags,
                tagRender: this.tagRender,
                header: this.getHeader(),
                isFilterable: true,
                className: Styles.fieldValuesFilter
            });
        }
    }

    return FieldValuesFilter;
}

export function fieldValuesColumnMenuFilter<T>(
    gridState: KendoGridState<T>,
    renderItem: (value: T[keyof T]) => string = defaultRenderItem
) {
    type Data = {
        value: T[keyof T];
        text: string;
    };
    @observer
    class FieldValuesColumnMenuFilter extends React.Component<GridColumnMenuFilterUIProps> {
        @observable data: Data[] = [];

        @observable searchQuery = '';

        @computed get processedData() {
            const searchQuery = this.searchQuery.toLowerCase();

            const filteredData = !searchQuery
                ? this.data
                : this.data.filter(v => v.text.toLowerCase().includes(searchQuery));

            return filteredData.sort((a, b) => {
                if (a.text === b.text) {
                    return 0;
                }

                return a.text < b.text ? -1 : 1;
            });
        }

        @computed get field() {
            const field = this.props.firstFilterProps.field;

            if (field === undefined) {
                throw 'missing field';
            }

            return field as keyof T;
        }

        @computed get value(): T[keyof T][] {
            return this.props.firstFilterProps.value || [];
        }

        private async fetchData(dataSource: DataSource<T> | null) {
            if (!dataSource) {
                return;
            }

            const items = (await dataSource.getData({})).data as T[];

            const values = items.map(i => i[this.field]);

            const distinctValues = values.filter((v, idx) => values.indexOf(v) === idx);

            runInAction(() => {
                this.data = distinctValues.map(value => ({ value, text: renderItem(value) }));
            });
        }

        componentDidMount() {
            this.fetchData(gridState.dataSource);
        }

        @action
        handleSearchQueryChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
            this.searchQuery = ev.target.value;
        };

        handleChange = (value: Data, checked: boolean, ev: React.FormEvent<HTMLInputElement>) => {
            const { firstFilterProps: filter } = this.props;

            const newFilterValue = checked
                ? this.value.concat(value.value)
                : this.value.filter((v: T[keyof T]) => v !== value.value);

            const hasValue = newFilterValue.length > 0;

            filter.onChange({
                value: hasValue ? newFilterValue : '',
                operator: hasValue ? operator : '',
                syntheticEvent: ev
            });
        };

        render() {
            return (
                <React.Fragment>
                    <Input
                        value={this.searchQuery}
                        onChange={this.handleSearchQueryChange}
                        placeholder="Search"
                    />

                    {this.processedData.map(item => (
                        <div key={JSON.stringify(item)}>
                            <Checkbox
                                label={item.text}
                                checked={this.value.includes(item.value)}
                                onChange={this.handleChange}
                                value={item}
                            />
                        </div>
                    ))}
                </React.Fragment>
            );
        }
    }

    return renderCustomColumnMenuFilter(FieldValuesColumnMenuFilter);
}

function defaultRenderItem(v: any): string {
    if (v == null) {
        return '';
    }

    // suppose v has toString();
    return v.toString();
}
