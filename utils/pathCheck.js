module.exports = {
    includes,
    endsWith,
}

function includes(path, part) {
    path = normalize(path);
    part = normalize(part);

    return path.includes(part);
}

function endsWith(path, part) {
    path = normalize(path);
    part = normalize(part);

    return path.endsWith(part);
}

function normalize(p) {
    return p.replace(/\\/g, '/').toLowerCase();
}
