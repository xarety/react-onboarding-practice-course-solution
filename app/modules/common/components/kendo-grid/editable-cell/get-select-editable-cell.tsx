import * as React from 'react';

import { observer } from 'mobx-react';

import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';

import { getEditableCell, EditorProps } from './get-editable-cell';

export function getSelectEditableCell<T>(data: T[]) {
    const Editor = observer<React.FC<EditorProps<T>>>(
        ({ field: { value, onChange, hasError, error } }) => {
            const handleChange = (event: DropDownListChangeEvent) => {
                onChange(event.target.value);
            };

            return (
                <td className="of-visible">
                    <DropDownList
                        data={data}
                        value={value}
                        onChange={handleChange}
                        valid={!hasError}
                        validationMessage={error}
                        className="w-100"
                    />
                </td>
            );
        }
    );

    return getEditableCell({
        editor: Editor
    });
} 
