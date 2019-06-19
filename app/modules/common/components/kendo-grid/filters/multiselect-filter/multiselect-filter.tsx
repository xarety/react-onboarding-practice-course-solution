import * as React from 'react';
import { action, observable } from 'mobx';
import { Checkbox } from '@servicetitan/design-system';
import { CheckboxProps } from 'semantic-ui-react';
import { FilterDescriptor } from '@progress/kendo-data-query';
import { GridFilterCell, GridFilterCellProps } from '@progress/kendo-react-grid';
import { GridColumnMenuFilterUIProps } from '@progress/kendo-react-grid/dist/npm/interfaces/GridColumnMenuFilterUIProps';
import {
    ListItemProps,
    MultiSelect,
    MultiSelectChangeEvent,
    MultiSelectFilterChangeEvent,
    MultiSelectTagData,
} from '@progress/kendo-react-dropdowns';
import { renderCustomColumnMenuFilter } from '../column-menu-filters';

interface RenderWithDataParams<T> {
    data: T[];
    tags?: MultiSelectTagData[];
    tagRender?: (tagData: MultiSelectTagData, li: React.ReactElement<any>) => React.ReactElement<any> | null;
    itemRender?: (li: React.ReactElement<any>, itemProps: ListItemProps) => React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    isMultiItem?: boolean;
    isFilterable?: boolean;
    className?: string;
}

export abstract class MultiSelectFilterBase<T> extends GridFilterCell {
    @observable protected value: T[] = [];
    @observable protected filter?: FilterDescriptor;

    contains = (item: T, valueList: T[]) => {
        return valueList.includes(item);
    }

    @action
    protected handleChange = (ev: MultiSelectChangeEvent) => {
        this.value = [...ev.target.value];

        const hasValue = ev.target.value.length > 0;
        this.props.onChange({
            value: hasValue ? ev.target.value : '',
            operator: hasValue ? this.contains : '',
            syntheticEvent: ev.syntheticEvent
        });
    }

    @action
    protected handleFilterChange = (ev: MultiSelectFilterChangeEvent) => {
        this.filter = ev.filter;
    }

    protected renderWithData({ data, tags, tagRender, itemRender, header, footer, isMultiItem, isFilterable, className }: RenderWithDataParams<T>) {
        return (
            <div className="k-filtercell">
                <MultiSelect
                    data={data}
                    onChange={this.handleChange}
                    value={[...this.value]}
                    filterable={isFilterable}
                    onFilterChange={isFilterable ? this.handleFilterChange : undefined}
                    tags={tags}
                    tagRender={tagRender}
                    itemRender={itemRender}
                    header={header}
                    footer={footer}
                    dataItemKey={isMultiItem ? 'propName' : undefined}
                    textField={isMultiItem ? 'displayText' : undefined}
                    className={className}
                />
            </div>
        );
    }
}

/** can be used for string, number and enum data
 * @param tagRender  Render tag function for enum data
 * @param itemRender Render dropdown item function for enum data
 */
export function singleItemMultiSelectFilter<T>(
    data: T[],
    tagRender?: (tagData: MultiSelectTagData, li: React.ReactElement<any>) => React.ReactElement<any> | null,
    itemRender?: (li: React.ReactElement<any>, itemProps: ListItemProps) => React.ReactNode
): React.ComponentClass<GridFilterCellProps> {
    return class extends MultiSelectFilterBase<T> {
        render() {
            return this.renderWithData({
                data,
                tagRender,
                itemRender
            });
        }
    };
}

export function multiItemMultiSelectFilter<T extends { propName: string }>(
    data: T[]
): React.ComponentClass<GridFilterCellProps> {
    return class extends MultiSelectFilterBase<T> {
        contains = (item: any, valueList: T[]) => {
            return valueList.some(val => item[val.propName] === true);
        }

        render() {
            return this.renderWithData({
                data,
                isMultiItem: true
            });
        }
    };
}

export function multiSelectTagRender(renderTag: (data: any) => JSX.Element) {
    // return tagRender callback for Kendo
    return (tagData: MultiSelectTagData, li: React.ReactElement<any>) =>
        React.cloneElement(li, li.props, [
            renderTag(tagData.data[0]),
            li.props.children[1] // the cross icon
        ]);
}

export function multiSelectItemRender(renderItem: (data: any) => JSX.Element) {
    // return itemRender callback for Kendo
    return (li: React.ReactElement<any>, itemProps: ListItemProps) =>
        React.cloneElement(li, li.props, renderItem(itemProps.dataItem));
}

export function singleItemMultiSelectColumnMenuFilter<T>(
    data: T[],
    renderItem?: (item: T) => string
) {
    class FilterUI extends MultiSelectFilterUIBase<T> {
        constructor(props: GridColumnMenuFilterUIProps) {
            super(props, data, renderItem);
        }
    }

    return renderCustomColumnMenuFilter(FilterUI);
}

export function multiItemMultiSelectColumnMenuFilter<T>(
    data: T[],
    renderItem?: (item: T) => string
) {
    class FilterUI extends MultiSelectFilterUIBase<T> {
        constructor(props: GridColumnMenuFilterUIProps) {
            super(props, data, renderItem);
        }

        contains = (item: any) => {
            let res = false;
            this.selectedItems.forEach((val) => {
                if (item[val] === true) {
                    res = true;
                    return;
                }
            });
            return res;
        }

        isItemChecked = (item: T) => this.selectedItems.has(item);
    }

    return renderCustomColumnMenuFilter(FilterUI);
}

abstract class MultiSelectFilterUIBase<T> extends React.Component<GridColumnMenuFilterUIProps> {

    constructor(
        props: GridColumnMenuFilterUIProps,
        private data: T[],
        private renderItem?: (item: T) => string
    ) {
        super(props);
    }
    protected selectedItems = this.props.firstFilterProps.value as Set<T> || new Set<T>();

    protected contains = (item: T) => this.selectedItems.has(item);
    protected isItemChecked?: (item: T) => boolean;

    protected onChange = (ev: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        const { firstFilterProps } = this.props;
        const { checked, value } = data;

        if (checked) {
            this.selectedItems.add(this.data[value as number]);
        } else {
            this.selectedItems.delete(this.data[value as number]);
        }

        const hasValue = this.selectedItems.size > 0;

        firstFilterProps.onChange({
            value: hasValue ? this.selectedItems : '',
            operator: hasValue ? this.contains : '',
            syntheticEvent: ev
        });
    }

    render() {
        return (
            <React.Fragment>
                {this.data.map((item, index) => (
                    <React.Fragment>
                        <Checkbox
                            key={index}
                            value={index}
                            label={!!this.renderItem ? this.renderItem(item) : item}
                            checked={!!this.isItemChecked ? this.isItemChecked(item) : this.contains(item)}
                            onChange={this.onChange}
                        />
                        <br />
                    </React.Fragment>
                ))}
            </React.Fragment>
        );
    }
}
