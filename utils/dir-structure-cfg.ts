import { Folder, NamingConvention, RootFolder } from 'folder-lint';

const jest: Folder[] = [
    {
        name: '__mocks__',
        children: { name: '*' },
        allowedExtensions: '.*',
    },
    {
        name: '__tests__',
        children: { name: '*' },
        // we can consider function support here that
        // e.g. merges previous allowed extensions and current ones
        // to make sure that store tests are still named xyz.store.test.ts
        allowedExtensions: ['.test.@(ts|tsx)', '.store.test.ts']
    }
];

const byFileType: Folder[] = [
    {
        name: 'stores',
        allowedExtensions: '.store.ts',
        children: [
            ...jest,
            { name: '*', children: jest },
        ],
    },
    {
        name: 'utils',
        allowedExtensions: '.ts',
        children: [
            ...jest,
            { name: '*', children: jest },
        ],
    },
    {
        name: 'components',
        allowedExtensions: ['.tsx', '.less', '.less.d.ts'],
        children: [
            ...jest,
            { name: '*', children: jest },
        ]
    },
    {
        name: 'api',
        allowedExtensions: '.api.ts',
        children: jest,
    },
    {
        name: 'styles',
        allowedExtensions: ['.less', '.less.d.ts', '.css'],
    },
    {
        name: 'enums',
        allowedExtensions: ['.ts'],
    },
    {
        name: 'assets',
        allowedExtensions: ['.png'], // other extensions?
    },
];

const config: RootFolder = {
    name: '<root>',
    namingConvention: NamingConvention.DashDelimitedLowercase,
    children: {
        name: 'app',
        allowedFiles: [
            'app.tsx',
            'custom.d.ts',
            'customized-kendo-titanium.css',
            'index.css',
            'index.ejs',
            'index.tsx',
            'kendo-titanium.css',
        ],
        allowedExtensions: '.*',
        children: {
            name: 'modules',
            allowedFiles: [],
            children: [
                { name: 'common', ignore: true },
                {
                    name: '*', // module level
                    allowedFiles: [],
                    children: [
                        ...byFileType,
                        {
                            name: '*', // section level
                            allowedFiles: [],
                            children: [
                                ...byFileType,
                                {
                                    name: '*', // page level
                                    allowedFiles: [],
                                    children: byFileType
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    },
};

// tslint:disable-next-line:no-default-export
export default config;
