const stub = {
    preprocess: () => [''],
    postprocess: ([msgs]) => msgs,
};

module.exports.processors = {
    '.ejs': stub,
    '.css': stub,
    '.less': stub,
    '.png': stub,
};
