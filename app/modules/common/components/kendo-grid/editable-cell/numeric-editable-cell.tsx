import * as React from 'react';

import { observer } from 'mobx-react';

import { NumericTextBox, NumericTextBoxChangeEvent } from '@progress/kendo-react-inputs';

import { getEditableCell, EditorProps } from './get-editable-cell';

const Editor = observer<React.FC<EditorProps<number | undefined>>>(
    ({ field: { value, onChange, hasError, error } }) => {
        const handleChange = (event: NumericTextBoxChangeEvent) => {
            onChange(event.value || undefined);
        };

        return (
            <td>
                <NumericTextBox
                    value={value}
                    onChange={handleChange}
                    valid={!hasError}
                    validationMessage={error}
                />
            </td>
        );
    }
);

export const NumericEditableCell = getEditableCell({
    editor: Editor
});
