import * as React from 'react';

import { observer } from 'mobx-react';

import { DatePicker, DatePickerChangeEvent } from '@progress/kendo-react-dateinputs';

import { getEditableCell, EditorProps } from './get-editable-cell';

const Editor = observer<React.FC<EditorProps<Date | null>>>(
    ({ fieldState: { value, onChange, hasError, error }, className }) => {
        const handleChange = (event: DatePickerChangeEvent) => {
            onChange(event.value);
        };

        return (
            <td className={className}>
                <DatePicker
                    value={value}
                    onChange={handleChange}
                    valid={!hasError}
                    validationMessage={error}
                />
            </td>
        );
    }
);

export const DateEditableCell = getEditableCell({
    editor: Editor
});
