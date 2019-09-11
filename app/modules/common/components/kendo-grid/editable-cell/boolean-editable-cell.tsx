import * as React from 'react';

import { observer } from 'mobx-react';

import { Checkbox } from '@servicetitan/design-system';

import { getEditableCell, EditorProps } from './get-editable-cell';

const Editor = observer<React.FC<EditorProps<boolean>>>(
    ({ fieldState: { value, onChange }, className }) => {
        const handleChange = (_0: never, checked: boolean) => {
            onChange(checked);
        };

        return (
            <td className={className}>
                <Checkbox checked={value} onChange={handleChange} style={{ marginRight: 0 }} />
            </td>
        );
    }
);

export const BooleanEditableCell = getEditableCell({
    editor: Editor
});
