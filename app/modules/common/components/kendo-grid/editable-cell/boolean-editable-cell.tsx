import * as React from 'react';

import { observer } from 'mobx-react';

import { Checkbox } from '@servicetitan/design-system';
import { CheckboxProps } from 'semantic-ui-react';

import { getEditableCell, EditorProps } from './get-editable-cell';

const Editor = observer<React.FC<EditorProps<boolean>>>(
    ({ field: { value, onChange } }) => {
        const handleChange = (_0: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
            onChange(!!data.checked);
        };

        return (
            <td>
                <Checkbox
                    checked={value}
                    onChange={handleChange}
                    style={{ marginRight: 0 }}
                />
            </td>
        );
    }
);

export const BooleanEditableCell = getEditableCell({
    editor: Editor
});
