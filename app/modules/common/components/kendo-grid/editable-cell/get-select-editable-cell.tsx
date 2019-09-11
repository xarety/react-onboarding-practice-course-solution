import * as React from 'react';

import { observer } from 'mobx-react';

import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';

import { KendoGridCellProps } from '../kendo-grid';
import { getEditableCell, EditorProps } from './get-editable-cell';

import { Option } from '../../../utils/form-helpers';

import * as classNames from 'classnames';

interface GetSelectEditableCellParams<T> {
    options: Option<T>[];
    viewer?: React.ComponentType<KendoGridCellProps<any>>;
}

export function getSelectEditableCell<T>({ options, viewer }: GetSelectEditableCellParams<T>) {
    const Editor = observer<React.FC<EditorProps<T>>>(
        ({ fieldState: { value, onChange, hasError, error }, className }) => {
            const selected = options.find(option => option.value === value);

            const handleChange = (event: DropDownListChangeEvent) => {
                onChange(event.target.value.value);
            };

            return (
                <td className={classNames('of-visible', className)}>
                    <DropDownList
                        data={options}
                        value={selected}
                        onChange={handleChange}
                        dataItemKey="value"
                        textField="text"
                        valid={!hasError}
                        validationMessage={error}
                        className="w-100"
                    />
                </td>
            );
        }
    );

    return getEditableCell({
        viewer,
        editor: Editor
    });
}
