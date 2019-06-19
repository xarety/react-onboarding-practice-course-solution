import * as React from 'react';

import { observer } from 'mobx-react';

import { Input } from '@progress/kendo-react-inputs';

import { getEditableCell, EditorProps } from './get-editable-cell';

const Editor = observer<React.FC<EditorProps<string>>>(
    ({ field: { value, onChange, hasError, error } }) => {
        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value);
        };

        return (
            <td>
                <Input
                    value={value}
                    onChange={handleChange}
                    valid={!hasError}
                    validationMessage={error}
                />
            </td>
        );
    }
);

export const TextEditableCell = getEditableCell({
    editor: Editor
});
