import * as React from 'react';

import { observer } from 'mobx-react';

import { Input } from '@progress/kendo-react-inputs';

import { getEditableCell, EditorProps } from './get-editable-cell';

import { Label } from '../../label';

export function getTextEditableCell(placeholder?: string) {
    const Editor = observer<React.FC<EditorProps<string>>>(
        ({ fieldState: { value, onChange, hasError, error }, className }) => {
            const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                onChange(event.target.value);
            };

            return (
                <td className={className}>
                    <Input
                        value={value}
                        onChange={handleChange}
                        valid={!hasError}
                        placeholder={placeholder}
                    />
                    {hasError && <Label label="" hasError error={error} />}
                </td>
            );
        }
    );

    return getEditableCell({
        editor: Editor
    });
}

export const TextEditableCell = getTextEditableCell();
