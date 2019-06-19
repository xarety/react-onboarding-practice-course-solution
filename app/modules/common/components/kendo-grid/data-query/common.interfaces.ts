export type Preprocessors<T> = {
    [P in keyof T]?: (value: T[P]) => any;
};
