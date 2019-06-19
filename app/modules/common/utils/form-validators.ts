import { DatetimeFieldState, FormValues } from './form-helpers';

interface DateRangeFieldStates {
    startDate: DatetimeFieldState;
    endDate: DatetimeFieldState;
}

const isDefined = (value: FormValues | undefined) => {
    if (value === undefined) {
        return false;
    }

    if (Array.isArray(value)) {
        return !!value.length;
    }

    return typeof value === 'string'
        ? !!value.trim()
        : !!value;
};

export const FormValidators = {
    required: (value?: FormValues) => !isDefined(value) && 'Value is required',

    hasLowerCase: (str: string) => /[a-z]/.test(str),

    hasUpperCase: (str: string) => /[A-Z]/.test(str),

    hasNumber: (str: string) => /\d/.test(str),

    passwordIsValidFormat: (password: string) =>
        password.length > 7 && FormValidators.hasLowerCase(password) && FormValidators.hasUpperCase(password) && FormValidators.hasNumber(password),

    emailFormatIsValid: (email: string) => {
        /* tslint:disable: ter-max-len */
        const regex = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        return email.length !== 0 && regex.test(email);
    },

    minDate: new Date(1900, 1, 1),

    maxDate: new Date(2099, 12, 31),

    isDateValid: (date: Date | null) => {
        return (
            !date
            || date > FormValidators.maxDate
            || date < FormValidators.minDate
        ) && 'Please provide a valid date';
    },

    isDateRangeValid: (dateRange: DateRangeFieldStates) => {
        return dateRange.startDate.$
            && dateRange.endDate.$
            && dateRange.startDate.$ > dateRange.endDate.$
            && 'Start Date should not be after End Date';
    },

    isAlphaNumeric: (str: string) => /^(\w+,?)*$/.test(str)
};
