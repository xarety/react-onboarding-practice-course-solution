const path = require('path');
const glob = require('glob');

module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
    plugins: [
        'import',
        'folder-schema',
        'processors-stub',
    ],
    extends: [
        'plugin:import/typescript',
    ],
    rules: {
        'folder-schema/check': ['error', {
            root: __dirname,
            config: path.resolve(__dirname, './utils/dir-structure-cfg'),
            docLink: 'https://servicetitan.quip.com/6aL7AkSOxaYa/File-naming-convention-folder-structure',
        }],

        'import/no-restricted-paths': ['error', {
            zones: [
                /** More details: https://servicetitan.quip.com/WjI2AhXrtgaX/Import-restrictions */
                ...moduleZones()
            ],
        }]
    }
}

function moduleZones() {
    const base = `./app/modules/`
    const modules = getSubDirs(base);

    const zones =
        modules
            .map(name => zone(base, name, ['common']))
    ;

    const subZones =
        modules
            .filter(name => name !== 'common')
            .map(name => subModulesZones(`${base}${name}/`, 2))
            .reduce(concatReducer, [])
    ;

    return [
        ...zones,
        ...subZones,
    ];
}

function subModulesZones(base, levels) {
    const byFileType = ['stores', 'api', 'utils', 'styles', 'components', 'enums', 'assets'];
    const isNotByFileType = name => !byFileType.includes(name);

    const subModules =
        getSubDirs(base)
            .filter(isNotByFileType)
    ;

    const zones =
        subModules
            .map(name => zone(base, name, byFileType))
    ;

    return [
        ...zones,
        ...subZones(),
    ];

    function subZones() {
        if (levels <= 0) {
            return [];
        }

        return (
            subModules
                .map(sm => subModulesZones(`${base}${sm}/`), levels - 1)
                .reduce(concatReducer, [])
        );
    }
}

function getSubDirs(base) {
    return glob
        .sync(base + '*/')
        .map(p => path.basename(p));
}

/**
 * zone('./app/', 'awesome', ['common'])
 * // => { target: './app/awesome', from: './app/(?!(awesome|common)/).*' }
 */
function zone(base, dirName, allowedSiblings = []) {
    const allowedImports = [
        dirName,
        ...allowedSiblings,
    ];

    return {
        target: base + dirName,
        from: `${base}(?!(${allowedImports.join('|')})/).*`
    };
}

function concatReducer(acc, xs) {
    return [...acc, ...xs];
}
