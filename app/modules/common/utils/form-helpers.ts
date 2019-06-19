import { DatePickerChangeEvent, TimePickerChangeEvent } from '@progress/kendo-react-dateinputs';
import { FieldState, FormState, ValidatableMapOrArray, ComposibleValidatable } from 'formstate';
import { toJS, isArrayLike } from 'mobx';

export class CheckboxFieldState extends FieldState<boolean> {
    onChangeHandler = (_0: React.SyntheticEvent<HTMLInputElement>, data: { checked?: boolean }) => {
        this.onChange(!!data.checked);
    }
}

export class InputFieldState<T> extends FieldState<T> {
    onChangeHandler = (_0: React.SyntheticEvent<HTMLInputElement>, data: { value: T }) => {
        this.onChange(data.value);
    }
}

export class TextAreaFieldState<T> extends FieldState<T> {
    // react-semantic type for onChange event of TextArea component seems to have a bug with data object type
    // so declaring data as any
    onChangeHandler = (_0: React.SyntheticEvent<HTMLTextAreaElement>, data: any) => {
        this.onChange(data.value);
    }
}

export class DropdownFieldState<T> extends FieldState<T> {
    // react-semantic type for onChange event of Dropdown component seems to have a bug with data object type
    // so declaring data as any
    onChangeHandler = (_0: React.SyntheticEvent<HTMLElement>, data: any) => {
        this.onChange(data.value);
    }
}

export class DropdownSearchFieldState<T> extends FieldState<T> {
    onChangeHandler = (_0: React.SyntheticEvent<HTMLElement>, data: { searchQuery: T }) => {
        this.onChange(data.searchQuery);
    }
}

export class DatetimeFieldState extends FieldState<Date | null> {
    onChangeHandler = (event: DatePickerChangeEvent | TimePickerChangeEvent) => {
        this.onChange(event.target.value);
    }
}

interface Option<T> {
    key: React.Key;
    text: React.ReactNode;
    value: T;
}

export function enumToOptions<T>(
    enumObject: T,
    nameProvider?: (value: T[keyof T]) => Option<T[keyof T]>['text']
): Option<T[keyof T]>[] {
    return getEnumKeys(enumObject).map(k => ({
        key: k as string,
        text: nameProvider ? nameProvider(enumObject[k]) : k,
        value: enumObject[k]
    }));
}

export function getEnumKeys<T>(enumObject: T) {
    let keys = Object.keys(enumObject) as (keyof T)[];

    if (keys.some(k => typeof enumObject[k] === 'number')) {
        keys = keys.filter(
            k => typeof enumObject[k] === 'number'
        );
    }

    return keys;
}

export function getEnumValues<T>(enumObject: T) {
    return getEnumKeys(enumObject).map(
        k => enumObject[k]
    );
}

export type FormValues = string | number | boolean | (string | number | boolean)[];
export interface FormStateAsJS {
    [index: string]: FormValues | FormStateAsJS;
}

export function traverseFormState<T extends ValidatableMapOrArray>(
    recursive: boolean,
    formState: FormState<T>,
    onFormVisit?: (key: string, form: FormState<any>) => void,
    onFieldVisit?: (key: string, field: FieldState<any>) => void
) {
    const visitChild = (key: string, child: ComposibleValidatable<any>) => {
        if (child instanceof FormState) {
            if (recursive) {
                traverseFormState(recursive, child, onFormVisit, onFieldVisit);
            }
            if (onFormVisit) {
                onFormVisit(key, child);
            }
        } else if (onFieldVisit) {
            onFieldVisit(key, child as FieldState<any>);
        }
    };

    if (isArrayLike(formState.$)) {
        formState.$.forEach((child, index) => visitChild(index.toString(), child));
    } else {
        Object.keys(formState.$).forEach((key) => {
            visitChild(key, (formState.$ as any)[key]);
        });
    }
}

// tslint:disable-next-line:function-name
export function BAD_formStateToJS<T extends ValidatableMapOrArray>(formState: FormState<T>) {
    const formValues: FormStateAsJS = {};
    traverseFormState(
        false,
        formState,
        (key: string, form: FormState<any>) => formValues[key] = BAD_formStateToJS(form),
        (key: string, field: FieldState<any>) => formValues[key] = toJS(field.value)
    );

    return formValues;
}

export type FormStateShape<T> = T extends FormState<infer U>[] ? FormStateObject<U>[] : FormStateObject<T>;

type FormStateObject<T> = {
    [P in keyof T]:
        T[P] extends FieldState<infer U> ? U :
        T[P] extends FormState<infer U> ? FormStateShape<U> :
        never;
};

export function formStateToJS<T extends ValidatableMapOrArray>(formState: FormState<T>): FormStateShape<T> {
    const formValues = isArrayLike(formState.$) ? [] : {} as any;
    traverseFormState(
        false,
        formState,
        (key: string, form: FormState<any>) => formValues[key] = formStateToJS(form),
        (key: string, field: FieldState<any>) => formValues[key] = toJS(field.$)
    );

    return formValues as FormStateShape<T>;
}

export type RecursivePartial<T> = T extends (infer U)[] ? RecursivePartialObject<U>[] : RecursivePartialObject<T>;

type RecursivePartialObject<T> = {
    [P in keyof T]?:
        T[P] extends object ? RecursivePartial<T[P]> :
        T[P];
};

export function setFormStateValues<T extends ValidatableMapOrArray>(
    formState: FormState<T>,
    data: RecursivePartial<FormStateShape<T>>): FormState<T> {
    if (isArrayLike(formState.$) && data.length !== formState.$.length) {
        throw new Error('Number of elements in data object node is different from number of element in form.' +
            ' All array nodes should match in size before values can be applied to form.');
    }
    traverseFormState(
        false,
        formState,
        (key: string, form: FormState<any>) => {
            if (data.hasOwnProperty(key)) {
                setFormStateValues(form, data[key as keyof typeof data]);
            }
        },
        (key: string, field: FieldState<any>) => {
            if (data.hasOwnProperty(key)) {
                field.value = data[key as keyof typeof data];
                field.$ = data[key as keyof typeof data];
            }
        }
    );
    return formState;
}

export function commitFormState<T extends ValidatableMapOrArray>(formState: FormState<T>) {
    traverseFormState(
        true,
        formState,
        undefined,
        (_0: string, field: FieldState<any>) => {
            field.dirty = false;
            (field as any)._initValue = field.value;
        }
    );
}

export function camelCaseToTitleCase(value: string) {
    const result = value.replace(/([A-Z])/g, ' $1');
    
    return result.slice(1);
}
