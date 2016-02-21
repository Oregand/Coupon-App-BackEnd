var codes = {
    INTERNAL:   'internal',
    VALIDATION: 'validation',
    DUPLICATE_KEY: 'duplicate_key',
};

function BaseError(type, message) {
    this.type = type;
    this.message = message;
}

BaseError.prototype = Object.create(Error.prototype);
BaseError.prototype.constructor = BaseError;
BaseError.prototype.name = 'BaseError';

// Internal Error
function InternalError(message) {
    this.message = message;
}

InternalError.prototype = Object.create(BaseError.prototype);
InternalError.prototype.constructor = InternalError;
InternalError.prototype.name = 'InternalError';
InternalError.prototype.type = codes.INTERNAL;


// Validation error
function ValidationError(field) {
    this.field = field;
    this.message = 'invalid value for: ' + field;
}

ValidationError.prototype = Object.create(BaseError.prototype);
ValidationError.prototype.constructor = ValidationError;
ValidationError.prototype.name = 'ValidationError';
ValidationError.prototype.type = codes.VALIDATION;


// Duplicate key error
function DuplicateKeyError(key) {
    this.key = key;
    this.message = 'duplicate value for: ' + key;
}

DuplicateKeyError.prototype = Object.create(BaseError.prototype);
DuplicateKeyError.prototype.constructor = DuplicateKeyError;
DuplicateKeyError.prototype.name = 'DuplicateKeyError';
DuplicateKeyError.prototype.type = codes.DUPLICATE_KEY;


function isMongoDuplicateKeyError(err) {
    return err.name === 'MongoError' && err.code === 11000;
}

module.exports = {
    codes: codes,
    InternalError: InternalError,
    ValidationError: ValidationError,
    DuplicateKeyError: DuplicateKeyError,
    isMongoDuplicateKeyError: isMongoDuplicateKeyError,
};
