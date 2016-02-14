module.exports = function (config) {
    return function *(next) {
        try {
            yield next;
        } catch (err) {
            this.status = err.status || 500;
            this.body = {
                error: {
                    status: err.status,
                    message: err.message,
                },
            };
            this.app.emit('error', err, this);
        }
    };
};
