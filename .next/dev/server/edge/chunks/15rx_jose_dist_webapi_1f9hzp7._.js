(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/15rx_jose_dist_webapi_1f9hzp7._.js",
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "concat",
    ()=>concat,
    "decoder",
    ()=>decoder,
    "encode",
    ()=>encode,
    "encoder",
    ()=>encoder,
    "strictDecoder",
    ()=>strictDecoder,
    "uint32be",
    ()=>uint32be,
    "uint64be",
    ()=>uint64be
]);
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const strictDecoder = new TextDecoder('utf-8', {
    fatal: true
});
const MAX_INT32 = 2 ** 32;
function concat(...buffers) {
    const size = buffers.reduce((acc, { length })=>acc + length, 0);
    const buf = new Uint8Array(size);
    let i = 0;
    for (const buffer of buffers){
        buf.set(buffer, i);
        i += buffer.length;
    }
    return buf;
}
function writeUInt32BE(buf, value, offset) {
    if (value < 0 || value >= MAX_INT32) {
        throw new RangeError(`value must be >= 0 and <= ${MAX_INT32 - 1}. Received ${value}`);
    }
    buf.set([
        value >>> 24,
        value >>> 16,
        value >>> 8,
        value & 0xff
    ], offset);
}
function uint64be(value) {
    const high = Math.floor(value / MAX_INT32);
    const low = value % MAX_INT32;
    const buf = new Uint8Array(8);
    writeUInt32BE(buf, high, 0);
    writeUInt32BE(buf, low, 4);
    return buf;
}
function uint32be(value) {
    const buf = new Uint8Array(4);
    writeUInt32BE(buf, value);
    return buf;
}
function encode(string) {
    const bytes = new Uint8Array(string.length);
    for(let i = 0; i < string.length; i++){
        const code = string.charCodeAt(i);
        if (code > 127) {
            throw new TypeError('non-ASCII string encountered in encode()');
        }
        bytes[i] = code;
    }
    return bytes;
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/base64.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeBase64",
    ()=>decodeBase64,
    "encodeBase64",
    ()=>encodeBase64
]);
function encodeBase64(input) {
    if (Uint8Array.prototype.toBase64) {
        return input.toBase64();
    }
    const CHUNK_SIZE = 0x8000;
    const arr = [];
    for(let i = 0; i < input.length; i += CHUNK_SIZE){
        arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
    }
    return btoa(arr.join(''));
}
function decodeBase64(encoded) {
    if (Uint8Array.fromBase64) {
        return Uint8Array.fromBase64(encoded);
    }
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for(let i = 0; i < binary.length; i++){
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decode",
    ()=>decode,
    "encode",
    ()=>encode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$base64$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/base64.js [middleware-edge] (ecmascript)");
;
;
function decode(input) {
    if (Uint8Array.fromBase64) {
        try {
            return Uint8Array.fromBase64(typeof input === 'string' ? input : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decoder"].decode(input), {
                alphabet: 'base64url'
            });
        } catch (cause) {
            throw new TypeError('The input to be decoded is not correctly encoded.', {
                cause
            });
        }
    }
    let encoded = input;
    if (encoded instanceof Uint8Array) {
        encoded = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decoder"].decode(encoded);
    }
    if (encoded.includes('+') || encoded.includes('/')) {
        throw new TypeError('The input to be decoded is not correctly encoded.');
    }
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$base64$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64"])(encoded);
    } catch  {
        throw new TypeError('The input to be decoded is not correctly encoded.');
    }
}
function encode(input) {
    let unencoded = input;
    if (typeof unencoded === 'string') {
        unencoded = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encoder"].encode(unencoded);
    }
    if (Uint8Array.prototype.toBase64) {
        return unencoded.toBase64({
            alphabet: 'base64url',
            omitPadding: true
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$base64$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encodeBase64"])(unencoded).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isDisjoint",
    ()=>isDisjoint,
    "isJWK",
    ()=>isJWK,
    "isObject",
    ()=>isObject,
    "isPrivateJWK",
    ()=>isPrivateJWK,
    "isPublicJWK",
    ()=>isPublicJWK,
    "isSecretJWK",
    ()=>isSecretJWK
]);
const isObjectLike = (value)=>typeof value === 'object' && value !== null;
function isObject(input) {
    if (!isObjectLike(input) || Object.prototype.toString.call(input) !== '[object Object]') {
        return false;
    }
    if (Object.getPrototypeOf(input) === null) {
        return true;
    }
    let proto = input;
    while(Object.getPrototypeOf(proto) !== null){
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(input) === proto;
}
function isDisjoint(...headers) {
    const sources = headers.filter(Boolean);
    if (sources.length === 0 || sources.length === 1) {
        return true;
    }
    let acc;
    for (const header of sources){
        const parameters = Object.keys(header);
        if (!acc || acc.size === 0) {
            acc = new Set(parameters);
            continue;
        }
        for (const parameter of parameters){
            if (acc.has(parameter)) {
                return false;
            }
            acc.add(parameter);
        }
    }
    return true;
}
const isJWK = (key)=>isObject(key) && typeof key.kty === 'string';
const isPrivateJWK = (key)=>key.kty !== 'oct' && (key.kty === 'AKP' && typeof key.priv === 'string' || typeof key.d === 'string');
const isPublicJWK = (key)=>key.kty !== 'oct' && key.d === undefined && key.priv === undefined;
const isSecretJWK = (key)=>key.kty === 'oct' && typeof key.k === 'string';
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/helpers.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertNotSet",
    ()=>assertNotSet,
    "decodeBase64url",
    ()=>decodeBase64url,
    "digest",
    ()=>digest,
    "encodeBase64url",
    ()=>encodeBase64url,
    "parseJoseHeader",
    ()=>parseJoseHeader,
    "unprotected",
    ()=>unprotected
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
;
;
;
const unprotected = Symbol();
function assertNotSet(value, name) {
    if (value) {
        throw new TypeError(`${name} can only be called once`);
    }
}
function decodeBase64url(value, label, ErrorClass) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decode"])(value);
    } catch  {
        throw new ErrorClass(`Failed to base64url decode the ${label}`);
    }
}
function encodeBase64url(value, label, ErrorClass) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(value);
    } catch  {
        throw new ErrorClass(`The ${label} is not a valid base64url string`);
    }
}
async function digest(algorithm, data) {
    const subtleDigest = `SHA-${algorithm.slice(-3)}`;
    return new Uint8Array(await crypto.subtle.digest(subtleDigest, data));
}
function parseJoseHeader(b64, ErrorClass, message) {
    let parsed;
    try {
        parsed = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["strictDecoder"].decode((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decode"])(b64)));
    } catch  {
        throw new ErrorClass(message);
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isObject"])(parsed)) {
        throw new ErrorClass(message);
    }
    return parsed;
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JOSEAlgNotAllowed",
    ()=>JOSEAlgNotAllowed,
    "JOSEError",
    ()=>JOSEError,
    "JOSENotSupported",
    ()=>JOSENotSupported,
    "JWEDecryptionFailed",
    ()=>JWEDecryptionFailed,
    "JWEInvalid",
    ()=>JWEInvalid,
    "JWKInvalid",
    ()=>JWKInvalid,
    "JWKSInvalid",
    ()=>JWKSInvalid,
    "JWKSMultipleMatchingKeys",
    ()=>JWKSMultipleMatchingKeys,
    "JWKSNoMatchingKey",
    ()=>JWKSNoMatchingKey,
    "JWKSTimeout",
    ()=>JWKSTimeout,
    "JWSInvalid",
    ()=>JWSInvalid,
    "JWSSignatureVerificationFailed",
    ()=>JWSSignatureVerificationFailed,
    "JWTClaimValidationFailed",
    ()=>JWTClaimValidationFailed,
    "JWTExpired",
    ()=>JWTExpired,
    "JWTInvalid",
    ()=>JWTInvalid
]);
class JOSEError extends Error {
    static code = 'ERR_JOSE_GENERIC';
    code = 'ERR_JOSE_GENERIC';
    constructor(message, options){
        super(message, options);
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
    }
}
class JWTClaimValidationFailed extends JOSEError {
    static code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
    code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
    claim;
    reason;
    payload;
    constructor(message, payload, claim = 'unspecified', reason = 'unspecified'){
        super(message, {
            cause: {
                claim,
                reason,
                payload
            }
        });
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
    }
}
class JWTExpired extends JOSEError {
    static code = 'ERR_JWT_EXPIRED';
    code = 'ERR_JWT_EXPIRED';
    claim;
    reason;
    payload;
    constructor(message, payload, claim = 'unspecified', reason = 'unspecified'){
        super(message, {
            cause: {
                claim,
                reason,
                payload
            }
        });
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
    }
}
class JOSEAlgNotAllowed extends JOSEError {
    static code = 'ERR_JOSE_ALG_NOT_ALLOWED';
    code = 'ERR_JOSE_ALG_NOT_ALLOWED';
}
class JOSENotSupported extends JOSEError {
    static code = 'ERR_JOSE_NOT_SUPPORTED';
    code = 'ERR_JOSE_NOT_SUPPORTED';
}
class JWEDecryptionFailed extends JOSEError {
    static code = 'ERR_JWE_DECRYPTION_FAILED';
    code = 'ERR_JWE_DECRYPTION_FAILED';
    constructor(message = 'decryption operation failed', options){
        super(message, options);
    }
}
class JWEInvalid extends JOSEError {
    static code = 'ERR_JWE_INVALID';
    code = 'ERR_JWE_INVALID';
}
class JWSInvalid extends JOSEError {
    static code = 'ERR_JWS_INVALID';
    code = 'ERR_JWS_INVALID';
}
class JWTInvalid extends JOSEError {
    static code = 'ERR_JWT_INVALID';
    code = 'ERR_JWT_INVALID';
}
class JWKInvalid extends JOSEError {
    static code = 'ERR_JWK_INVALID';
    code = 'ERR_JWK_INVALID';
}
class JWKSInvalid extends JOSEError {
    static code = 'ERR_JWKS_INVALID';
    code = 'ERR_JWKS_INVALID';
}
class JWKSNoMatchingKey extends JOSEError {
    static code = 'ERR_JWKS_NO_MATCHING_KEY';
    code = 'ERR_JWKS_NO_MATCHING_KEY';
    constructor(message = 'no applicable key found in the JSON Web Key Set', options){
        super(message, options);
    }
}
class JWKSMultipleMatchingKeys extends JOSEError {
    [Symbol.asyncIterator] = async function*() {};
    static code = 'ERR_JWKS_MULTIPLE_MATCHING_KEYS';
    code = 'ERR_JWKS_MULTIPLE_MATCHING_KEYS';
    constructor(message = 'multiple matching keys found in the JSON Web Key Set', options){
        super(message, options);
    }
}
class JWKSTimeout extends JOSEError {
    static code = 'ERR_JWKS_TIMEOUT';
    code = 'ERR_JWKS_TIMEOUT';
    constructor(message = 'request timed out', options){
        super(message, options);
    }
}
class JWSSignatureVerificationFailed extends JOSEError {
    static code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
    code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
    constructor(message = 'signature verification failed', options){
        super(message, options);
    }
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/crypto_key.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkCryptoKey",
    ()=>checkCryptoKey,
    "checkUsage",
    ()=>checkUsage
]);
const unusable = (name, prop = 'algorithm.name')=>new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
function checkUsage(key, usage) {
    if (usage && !key.usages.includes(usage)) {
        throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
    }
}
function checkCryptoKey(key, expected, usage) {
    const algorithm = key.algorithm;
    if (algorithm.name !== expected.name) {
        throw unusable(expected.name);
    }
    if (expected.hash && algorithm.hash?.name !== expected.hash) {
        throw unusable(expected.hash, 'algorithm.hash');
    }
    if (expected.namedCurve && algorithm.namedCurve !== expected.namedCurve) {
        throw unusable(expected.namedCurve, 'algorithm.namedCurve');
    }
    if (expected.length !== undefined && algorithm.length !== expected.length) {
        throw unusable(expected.length, 'algorithm.length');
    }
    checkUsage(key, usage);
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/invalid_key_input.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "invalidKeyInput",
    ()=>invalidKeyInput,
    "withAlg",
    ()=>withAlg
]);
function message(msg, actual, ...types) {
    types = types.filter(Boolean);
    if (types.length > 2) {
        const last = types.pop();
        msg += `one of type ${types.join(', ')}, or ${last}.`;
    } else if (types.length === 2) {
        msg += `one of type ${types[0]} or ${types[1]}.`;
    } else {
        msg += `of type ${types[0]}.`;
    }
    if (actual == null) {
        msg += ` Received ${actual}`;
    } else if (typeof actual === 'function' && actual.name) {
        msg += ` Received function ${actual.name}`;
    } else if (typeof actual === 'object' && actual != null) {
        if (actual.constructor?.name) {
            msg += ` Received an instance of ${actual.constructor.name}`;
        }
    }
    return msg;
}
const invalidKeyInput = (actual, ...types)=>message('Key must be ', actual, ...types);
const withAlg = (alg, actual, ...types)=>message(`Key for the ${alg} algorithm must be `, actual, ...types);
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/is_key_like.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertCryptoKey",
    ()=>assertCryptoKey,
    "isCryptoKey",
    ()=>isCryptoKey,
    "isKeyLike",
    ()=>isKeyLike,
    "isKeyObject",
    ()=>isKeyObject
]);
function assertCryptoKey(key) {
    if (!isCryptoKey(key)) {
        throw new Error('CryptoKey instance expected');
    }
}
const isCryptoKey = (key)=>{
    if (key?.[Symbol.toStringTag] === 'CryptoKey') return true;
    try {
        return key instanceof CryptoKey;
    } catch  {
        return false;
    }
};
const isKeyObject = (key)=>key?.[Symbol.toStringTag] === 'KeyObject';
const isKeyLike = (key)=>isCryptoKey(key) || isKeyObject(key);
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/content_encryption.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkIvLength",
    ()=>checkIvLength,
    "decrypt",
    ()=>decrypt,
    "encrypt",
    ()=>encrypt,
    "generateCek",
    ()=>generateCek,
    "generateIv",
    ()=>generateIv
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/crypto_key.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/invalid_key_input.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/is_key_like.js [middleware-edge] (ecmascript)");
;
;
;
;
;
const generateCek = (enc)=>crypto.getRandomValues(new Uint8Array(enc.cekBits >> 3));
function checkCekLength(cek, expected) {
    const actual = cek.byteLength << 3;
    if (actual !== expected) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"](`Invalid Content Encryption Key length. Expected ${expected} bits, got ${actual} bits`);
    }
}
const generateIv = (enc)=>crypto.getRandomValues(new Uint8Array(enc.ivBits >> 3));
function checkIvLength(enc, iv) {
    if (iv.length << 3 !== enc.ivBits) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('Invalid Initialization Vector length');
    }
}
async function cbcKeySetup(enc, cek, usage) {
    if (!(cek instanceof Uint8Array)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["invalidKeyInput"])(cek, 'Uint8Array'));
    }
    const keySize = enc.cekBits >> 1;
    const encKey = await crypto.subtle.importKey('raw', cek.subarray(keySize >> 3), 'AES-CBC', false, [
        usage
    ]);
    const macKey = await crypto.subtle.importKey('raw', cek.subarray(0, keySize >> 3), {
        hash: `SHA-${keySize << 1}`,
        name: 'HMAC'
    }, false, [
        'sign'
    ]);
    return {
        encKey,
        macKey,
        keySize
    };
}
async function cbcHmacTag(macKey, macData, keySize) {
    return new Uint8Array((await crypto.subtle.sign('HMAC', macKey, macData)).slice(0, keySize >> 3));
}
async function cbcEncrypt(enc, plaintext, cek, iv, aad) {
    const { encKey, macKey, keySize } = await cbcKeySetup(enc, cek, 'encrypt');
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({
        iv: iv,
        name: 'AES-CBC'
    }, encKey, plaintext));
    const macData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["concat"])(aad, iv, ciphertext, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["uint64be"])(aad.length * 8));
    const tag = await cbcHmacTag(macKey, macData, keySize);
    return {
        ciphertext,
        tag,
        iv
    };
}
async function timingSafeEqual(a, b) {
    if (!(a instanceof Uint8Array)) {
        throw new TypeError('First argument must be a buffer');
    }
    if (!(b instanceof Uint8Array)) {
        throw new TypeError('Second argument must be a buffer');
    }
    const algorithm = {
        name: 'HMAC',
        hash: 'SHA-256'
    };
    const key = await crypto.subtle.generateKey(algorithm, false, [
        'sign'
    ]);
    const aHmac = new Uint8Array(await crypto.subtle.sign(algorithm, key, a));
    const bHmac = new Uint8Array(await crypto.subtle.sign(algorithm, key, b));
    let out = 0;
    let i = -1;
    while(++i < 32){
        out |= aHmac[i] ^ bHmac[i];
    }
    return out === 0;
}
async function cbcDecrypt(enc, cek, ciphertext, iv, tag, aad) {
    const { encKey, macKey, keySize } = await cbcKeySetup(enc, cek, 'decrypt');
    const macData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["concat"])(aad, iv, ciphertext, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["uint64be"])(aad.length * 8));
    const expectedTag = await cbcHmacTag(macKey, macData, keySize);
    let macCheckPassed;
    try {
        macCheckPassed = await timingSafeEqual(tag, expectedTag);
    } catch  {}
    if (!macCheckPassed) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEDecryptionFailed"]();
    }
    let plaintext;
    try {
        plaintext = new Uint8Array(await crypto.subtle.decrypt({
            iv: iv,
            name: 'AES-CBC'
        }, encKey, ciphertext));
    } catch  {}
    if (!plaintext) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEDecryptionFailed"]();
    }
    return plaintext;
}
async function gcmEncrypt(enc, plaintext, cek, iv, aad) {
    let encKey;
    if (cek instanceof Uint8Array) {
        encKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, [
            'encrypt'
        ]);
    } else {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkCryptoKey"])(cek, enc.subtle, 'encrypt');
        encKey = cek;
    }
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({
        additionalData: aad,
        iv: iv,
        name: 'AES-GCM',
        tagLength: 128
    }, encKey, plaintext));
    const tag = encrypted.slice(-16);
    const ciphertext = encrypted.slice(0, -16);
    return {
        ciphertext,
        tag,
        iv
    };
}
async function gcmDecrypt(enc, cek, ciphertext, iv, tag, aad) {
    let encKey;
    if (cek instanceof Uint8Array) {
        encKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, [
            'decrypt'
        ]);
    } else {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkCryptoKey"])(cek, enc.subtle, 'decrypt');
        encKey = cek;
    }
    try {
        return new Uint8Array(await crypto.subtle.decrypt({
            additionalData: aad,
            iv: iv,
            name: 'AES-GCM',
            tagLength: 128
        }, encKey, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["concat"])(ciphertext, tag)));
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEDecryptionFailed"]();
    }
}
async function encrypt(enc, plaintext, cek, iv, aad) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isCryptoKey"])(cek) && !(cek instanceof Uint8Array)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["invalidKeyInput"])(cek, 'CryptoKey', 'KeyObject', 'Uint8Array', 'JSON Web Key'));
    }
    if (iv) {
        checkIvLength(enc, iv);
    } else {
        iv = generateIv(enc);
    }
    if (cek instanceof Uint8Array) {
        checkCekLength(cek, enc.cekBits);
    }
    return enc.cbc ? cbcEncrypt(enc, plaintext, cek, iv, aad) : gcmEncrypt(enc, plaintext, cek, iv, aad);
}
async function decrypt(enc, cek, ciphertext, iv, tag, aad) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isCryptoKey"])(cek) && !(cek instanceof Uint8Array)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["invalidKeyInput"])(cek, 'CryptoKey', 'KeyObject', 'Uint8Array', 'JSON Web Key'));
    }
    if (!iv) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Initialization Vector missing');
    }
    if (!tag) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Authentication Tag missing');
    }
    checkIvLength(enc, iv);
    if (cek instanceof Uint8Array) {
        checkCekLength(cek, enc.cekBits);
    }
    return enc.cbc ? cbcDecrypt(enc, cek, ciphertext, iv, tag, aad) : gcmDecrypt(enc, cek, ciphertext, iv, tag, aad);
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwk_to_key.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jwkToKey",
    ()=>jwkToKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
;
const unsupportedAlg = 'Invalid or unsupported JWK "alg" (Algorithm) Parameter value';
function subtleParams(entry, jwk) {
    if (!entry.kty.includes(jwk.kty)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](unsupportedAlg);
    }
    return entry.subtleFor?.({
        kty: jwk.kty,
        crv: jwk.crv
    }) ?? entry.subtle;
}
async function jwkToKey(entry, jwk) {
    if (jwk.kty === 'RSA' && 'oth' in jwk && jwk.oth !== undefined) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
    }
    const algorithm = subtleParams(entry, jwk);
    const isPrivate = !!(jwk.d || jwk.priv);
    const keyUsages = isPrivate ? entry.usages.private : entry.usages.public;
    const keyData = {
        ...jwk
    };
    if (keyData.kty !== 'AKP') {
        delete keyData.alg;
    }
    delete keyData.use;
    return crypto.subtle.importKey('jwk', keyData, algorithm, jwk.ext ?? (isPrivate ? false : true), jwk.key_ops ?? keyUsages);
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/key.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkKeyType",
    ()=>checkKeyType,
    "prepareKey",
    ()=>prepareKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/invalid_key_input.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/is_key_like.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwk_to_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwk_to_key.js [middleware-edge] (ecmascript)");
;
;
;
;
;
const tag = (key)=>key[Symbol.toStringTag];
const jwkMatchesOp = (entry, key, usage)=>{
    const { alg } = entry;
    if (key.use !== undefined) {
        let expected;
        switch(usage){
            case 'sign':
            case 'verify':
                expected = 'sig';
                break;
            case 'encrypt':
            case 'decrypt':
                expected = 'enc';
                break;
        }
        if (key.use !== expected) {
            throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
        }
    }
    if (key.alg !== undefined && key.alg !== alg) {
        throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
    }
    if (Array.isArray(key.key_ops)) {
        const expectedKeyOp = usage === 'encrypt' || usage === 'decrypt' ? entry.keyOps?.[usage] : usage;
        if (expectedKeyOp && key.key_ops?.includes?.(expectedKeyOp) === false) {
            throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
        }
    }
    return true;
};
const symmetricTypeCheck = (entry, key, usage)=>{
    const { alg } = entry;
    if (key instanceof Uint8Array) return {
        kind: BYTES,
        key
    };
    if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isJWK"](key)) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isSecretJWK"](key) && jwkMatchesOp(entry, key, usage)) return {
            kind: JWK,
            key
        };
        throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isKeyLike"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["withAlg"])(alg, key, 'CryptoKey', 'KeyObject', 'JSON Web Key', 'Uint8Array'));
    }
    if (key.type !== 'secret') {
        throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isCryptoKey"])(key) ? {
        kind: CRYPTO,
        key
    } : {
        kind: KEYOBJECT,
        key
    };
};
const asymmetricTypeCheck = (entry, key, usage)=>{
    const { alg } = entry;
    if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isJWK"](key)) {
        switch(usage){
            case 'decrypt':
            case 'sign':
                if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isPrivateJWK"](key) && jwkMatchesOp(entry, key, usage)) return {
                    kind: JWK,
                    key
                };
                throw new TypeError(`JSON Web Key for this operation must be a private JWK`);
            case 'encrypt':
            case 'verify':
                if (__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isPublicJWK"](key) && jwkMatchesOp(entry, key, usage)) return {
                    kind: JWK,
                    key
                };
                throw new TypeError(`JSON Web Key for this operation must be a public JWK`);
        }
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isKeyLike"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["withAlg"])(alg, key, 'CryptoKey', 'KeyObject', 'JSON Web Key'));
    }
    if (key.type === 'secret') {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
    }
    if (key.type === 'public') {
        switch(usage){
            case 'sign':
                throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
            case 'decrypt':
                throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
        }
    }
    if (key.type === 'private') {
        switch(usage){
            case 'verify':
                throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
            case 'encrypt':
                throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isCryptoKey"])(key) ? {
        kind: CRYPTO,
        key
    } : {
        kind: KEYOBJECT,
        key
    };
};
const BYTES = Symbol();
const CRYPTO = Symbol();
const KEYOBJECT = Symbol();
const JWK = Symbol();
function checkKeyType(entry, key, usage) {
    return entry.symmetric ? symmetricTypeCheck(entry, key, usage) : asymmetricTypeCheck(entry, key, usage);
}
let cache;
const nist = {
    __proto__: null,
    prime256v1: 'P-256',
    secp384r1: 'P-384',
    secp521r1: 'P-521'
};
function cached(key, alg) {
    cache ||= new WeakMap();
    return cache.get(key)?.[alg];
}
function store(key, alg, cryptoKey) {
    const entry = cache.get(key);
    if (entry) {
        entry[alg] = cryptoKey;
    } else {
        cache.set(key, {
            [alg]: cryptoKey
        });
    }
    return cryptoKey;
}
const handleJWK = async (key, jwk, entry)=>{
    const hit = cached(key, entry.alg);
    if (hit) return hit;
    const cryptoKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwk_to_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jwkToKey"])(entry, {
        ...jwk,
        alg: entry.alg
    });
    return store(key, entry.alg, cryptoKey);
};
const handleKeyObject = (keyObject, entry)=>{
    const hit = cached(keyObject, entry.alg);
    if (hit) return hit;
    const isPublic = keyObject.type === 'public';
    const usages = isPublic ? entry.usages.public : entry.usages.private;
    const { asymmetricKeyType } = keyObject;
    const crv = nist[keyObject.asymmetricKeyDetails?.namedCurve];
    const params = entry.subtleFor?.({
        crv,
        asymmetricKeyType
    }) ?? entry.subtle;
    return store(keyObject, entry.alg, keyObject.toCryptoKey(params, isPublic, usages));
};
async function prepareKey(entry, key, usage) {
    const tagged = checkKeyType(entry, key, usage);
    switch(tagged.kind){
        case BYTES:
        case CRYPTO:
            return tagged.key;
        case JWK:
            {
                if (tagged.key.k) {
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decode"])(tagged.key.k);
                }
                if (!Object.isFrozen(tagged.key)) {
                    const { key_ops } = tagged.key;
                    if (Array.isArray(key_ops)) Object.freeze(key_ops);
                    Object.freeze(tagged.key);
                }
                return handleJWK(tagged.key, tagged.key, entry);
            }
        case KEYOBJECT:
            {
                const keyObject = tagged.key;
                if (keyObject.type === 'secret') {
                    return keyObject.export();
                }
                if ('toCryptoKey' in keyObject && typeof keyObject.toCryptoKey === 'function') {
                    return handleKeyObject(keyObject, entry);
                }
                return handleJWK(keyObject, keyObject.export({
                    format: 'jwk'
                }), entry);
            }
    }
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/key_descriptor.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "table",
    ()=>table
]);
function table(entries) {
    const out = {
        __proto__: null
    };
    for (const alg of Object.keys(entries)){
        out[alg] = {
            ...entries[alg],
            alg
        };
    }
    return out;
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwe_algorithms.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jweAlgorithm",
    ()=>jweAlgorithm,
    "jweEncryption",
    ()=>jweEncryption,
    "maybeJWEAlgorithm",
    ()=>maybeJWEAlgorithm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key_descriptor$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/key_descriptor.js [middleware-edge] (ecmascript)");
;
;
const wrap = {
    public: [
        'encrypt',
        'wrapKey'
    ],
    private: [
        'decrypt',
        'unwrapKey'
    ]
};
const derive = {
    public: [],
    private: [
        'deriveBits'
    ]
};
const none = {
    public: [],
    private: []
};
function rsaes(bits) {
    return {
        kty: [
            'RSA'
        ],
        subtle: {
            name: 'RSA-OAEP',
            hash: `SHA-${bits}`
        },
        usages: wrap,
        minModulusLength: 2048,
        keyOps: {
            encrypt: 'wrapKey',
            decrypt: 'unwrapKey'
        }
    };
}
function ecdh(kwBits) {
    return {
        kty: [
            'EC',
            'OKP'
        ],
        subtle: {
            name: 'ECDH'
        },
        subtleFor: ({ kty, crv, asymmetricKeyType })=>{
            if (crv === 'X25519' || asymmetricKeyType === 'x25519') {
                return {
                    name: 'X25519'
                };
            }
            if (kty === 'OKP') {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
            }
            return {
                name: 'ECDH',
                namedCurve: crv
            };
        },
        usages: derive,
        kwBits,
        keyOps: {
            decrypt: 'deriveBits'
        }
    };
}
function aeskw(bits) {
    return {
        kty: [
            'oct'
        ],
        symmetric: true,
        subtle: {
            name: 'AES-KW',
            length: bits
        },
        usages: none,
        keyOps: {
            encrypt: 'wrapKey',
            decrypt: 'unwrapKey'
        }
    };
}
function aesgcmkw(bits) {
    return {
        kty: [
            'oct'
        ],
        symmetric: true,
        subtle: {
            name: 'AES-GCM',
            length: bits
        },
        usages: none,
        gcmkw: `A${bits}GCM`,
        keyOps: {
            encrypt: 'encrypt',
            decrypt: 'decrypt'
        }
    };
}
function pbes2(bits, kwBits) {
    return {
        kty: [
            'oct'
        ],
        symmetric: true,
        subtle: {
            name: 'PBKDF2'
        },
        usages: none,
        pbes2Hash: `SHA-${bits}`,
        kwBits,
        keyOps: {
            encrypt: 'deriveBits',
            decrypt: 'deriveBits'
        }
    };
}
const JWE = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key_descriptor$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["table"])({
    dir: {
        kty: [
            'oct'
        ],
        symmetric: true,
        subtle: {
            name: 'AES-GCM'
        },
        usages: none,
        keyOps: {
            encrypt: 'encrypt',
            decrypt: 'decrypt'
        }
    },
    'RSA-OAEP': rsaes(1),
    'RSA-OAEP-256': rsaes(256),
    'RSA-OAEP-384': rsaes(384),
    'RSA-OAEP-512': rsaes(512),
    'ECDH-ES': ecdh(),
    'ECDH-ES+A128KW': ecdh(128),
    'ECDH-ES+A192KW': ecdh(192),
    'ECDH-ES+A256KW': ecdh(256),
    A128KW: aeskw(128),
    A192KW: aeskw(192),
    A256KW: aeskw(256),
    A128GCMKW: aesgcmkw(128),
    A192GCMKW: aesgcmkw(192),
    A256GCMKW: aesgcmkw(256),
    'PBES2-HS256+A128KW': pbes2(256, 128),
    'PBES2-HS384+A192KW': pbes2(384, 192),
    'PBES2-HS512+A256KW': pbes2(512, 256)
});
const content = {
    public: [],
    private: []
};
const contentOps = {
    encrypt: 'encrypt',
    decrypt: 'decrypt'
};
function gcm(bits) {
    return {
        kty: [
            'oct'
        ],
        symmetric: true,
        subtle: {
            name: 'AES-GCM',
            length: bits
        },
        usages: content,
        keyOps: contentOps,
        cekBits: bits,
        ivBits: 96,
        cbc: false
    };
}
function cbc(bits) {
    return {
        kty: [
            'oct'
        ],
        symmetric: true,
        subtle: {
            name: 'AES-CBC',
            length: bits
        },
        usages: content,
        keyOps: contentOps,
        cekBits: bits,
        ivBits: 128,
        cbc: true
    };
}
const ENC = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key_descriptor$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["table"])({
    A128GCM: gcm(128),
    A192GCM: gcm(192),
    A256GCM: gcm(256),
    'A128CBC-HS256': cbc(256),
    'A192CBC-HS384': cbc(384),
    'A256CBC-HS512': cbc(512)
});
const unsupportedAlgHeader = 'Invalid or unsupported "alg" (JWE Algorithm) header value';
function jweAlgorithm(alg) {
    const entry = JWE[alg];
    if (!entry) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](unsupportedAlgHeader);
    }
    return entry;
}
function maybeJWEAlgorithm(alg) {
    return JWE[alg];
}
function jweEncryption(enc) {
    const entry = ENC[enc];
    if (!entry) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](`Unsupported JWE Algorithm: ${enc}`);
    }
    return entry;
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/signing.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkModulusLength",
    ()=>checkModulusLength,
    "sign",
    ()=>sign,
    "verify",
    ()=>verify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/crypto_key.js [middleware-edge] (ecmascript)");
;
function checkModulusLength(alg, key) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== 'number' || modulusLength < 2048) {
        throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
}
function checkSigCryptoKey(entry, key, usage) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkCryptoKey"])(key, entry.subtle, usage);
    if (entry.minModulusLength) {
        checkModulusLength(entry.alg, key);
    }
}
async function getSigKey(entry, key, usage) {
    if (key instanceof Uint8Array) {
        return crypto.subtle.importKey('raw', key, entry.subtle, false, [
            usage
        ]);
    }
    checkSigCryptoKey(entry, key, usage);
    return key;
}
async function sign(entry, key, data) {
    const cryptoKey = await getSigKey(entry, key, 'sign');
    const signature = await crypto.subtle.sign(entry.operation, cryptoKey, data);
    return new Uint8Array(signature);
}
async function verify(entry, key, signature, data) {
    const cryptoKey = await getSigKey(entry, key, 'verify');
    try {
        return await crypto.subtle.verify(entry.operation, cryptoKey, signature, data);
    } catch  {
        return false;
    }
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/key_management.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decryptKeyManagement",
    ()=>decryptKeyManagement,
    "encryptKeyManagement",
    ()=>encryptKeyManagement
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/key.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwk_to_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwk_to_key.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwe_algorithms.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/helpers.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/content_encryption.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/crypto_key.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$signing$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/signing.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/is_key_like.js [middleware-edge] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
function checkEcdhCryptoKey(key, usage) {
    switch(key.algorithm.name){
        case 'ECDH':
        case 'X25519':
            break;
        default:
            throw new TypeError('CryptoKey does not support this operation, its algorithm.name must be ECDH or X25519');
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkUsage"])(key, usage);
}
function checkKeySize(key, alg) {
    if (key.algorithm.length !== parseInt(alg.slice(1, 4), 10)) {
        throw new TypeError(`Invalid key size for alg: ${alg}`);
    }
}
function aeskwCryptoKey(key, alg, usage) {
    if (key instanceof Uint8Array) {
        return crypto.subtle.importKey('raw', key, 'AES-KW', true, [
            usage
        ]);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkCryptoKey"])(key, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweAlgorithm"])(alg).subtle, usage);
    return key;
}
async function aeskwWrap(alg, key, cek) {
    const cryptoKey = await aeskwCryptoKey(key, alg, 'wrapKey');
    checkKeySize(cryptoKey, alg);
    const cryptoKeyCek = await crypto.subtle.importKey('raw', cek, {
        hash: 'SHA-256',
        name: 'HMAC'
    }, true, [
        'sign'
    ]);
    return new Uint8Array(await crypto.subtle.wrapKey('raw', cryptoKeyCek, cryptoKey, 'AES-KW'));
}
async function aeskwUnwrap(alg, key, encryptedKey) {
    const cryptoKey = await aeskwCryptoKey(key, alg, 'unwrapKey');
    checkKeySize(cryptoKey, alg);
    const cryptoKeyCek = await crypto.subtle.unwrapKey('raw', encryptedKey, cryptoKey, 'AES-KW', {
        hash: 'SHA-256',
        name: 'HMAC'
    }, true, [
        'sign'
    ]);
    return new Uint8Array(await crypto.subtle.exportKey('raw', cryptoKeyCek));
}
async function aesGcmKwWrap(gcm, key, cek, iv) {
    const wrapped = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encrypt"])(gcm, cek, key, iv, new Uint8Array());
    return {
        encryptedKey: wrapped.ciphertext,
        iv: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(wrapped.iv),
        tag: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(wrapped.tag)
    };
}
async function aesGcmKwUnwrap(gcm, key, encryptedKey, iv, tag) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decrypt"])(gcm, key, encryptedKey, iv, tag, new Uint8Array());
}
const subtleAlgorithm = (alg)=>{
    switch(alg){
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            return 'RSA-OAEP';
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](`alg ${alg} is not supported either by JOSE or your javascript runtime`);
    }
};
async function rsaesEncrypt(alg, key, cek) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkCryptoKey"])(key, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweAlgorithm"])(alg).subtle, 'encrypt');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$signing$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkModulusLength"])(alg, key);
    return new Uint8Array(await crypto.subtle.encrypt(subtleAlgorithm(alg), key, cek));
}
async function rsaesDecrypt(alg, key, encryptedKey) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkCryptoKey"])(key, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweAlgorithm"])(alg).subtle, 'decrypt');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$signing$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkModulusLength"])(alg, key);
    return new Uint8Array(await crypto.subtle.decrypt(subtleAlgorithm(alg), key, encryptedKey));
}
function pbes2CryptoKey(key, alg) {
    if (key instanceof Uint8Array) {
        return crypto.subtle.importKey('raw', key, 'PBKDF2', false, [
            'deriveBits'
        ]);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$crypto_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkCryptoKey"])(key, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweAlgorithm"])(alg).subtle, 'deriveBits');
    return key;
}
const concatSalt = (alg, p2sInput)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["concat"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(alg), Uint8Array.of(0x00), p2sInput);
async function deriveKey(p2s, alg, p2c, key) {
    if (!(p2s instanceof Uint8Array) || p2s.length < 8) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('PBES2 Salt Input must be 8 or more octets');
    }
    if (!Number.isSafeInteger(p2c) || Math.sign(p2c) !== 1) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('PBES2 Count Input must be a positive integer');
    }
    const salt = concatSalt(alg, p2s);
    const keylen = parseInt(alg.slice(13, 16), 10);
    const subtleAlg = {
        hash: `SHA-${alg.slice(8, 11)}`,
        iterations: p2c,
        name: 'PBKDF2',
        salt
    };
    const cryptoKey = await pbes2CryptoKey(key, alg);
    return new Uint8Array(await crypto.subtle.deriveBits(subtleAlg, cryptoKey, keylen));
}
async function pbes2kwWrap(alg, key, cek, p2c = 2048, p2s = crypto.getRandomValues(new Uint8Array(16))) {
    const derived = await deriveKey(p2s, alg, p2c, key);
    const encryptedKey = await aeskwWrap(alg.slice(-6), derived, cek);
    return {
        encryptedKey,
        p2c,
        p2s: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(p2s)
    };
}
async function pbes2kwUnwrap(alg, key, encryptedKey, p2c, p2s) {
    const derived = await deriveKey(p2s, alg, p2c, key);
    return aeskwUnwrap(alg.slice(-6), derived, encryptedKey);
}
function lengthAndInput(input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["concat"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["uint32be"])(input.length), input);
}
async function concatKdf(Z, L, OtherInfo) {
    const dkLen = L >> 3;
    const hashLen = 32;
    const reps = Math.ceil(dkLen / hashLen);
    const dk = new Uint8Array(reps * hashLen);
    for(let i = 1; i <= reps; i++){
        const hashInput = new Uint8Array(4 + Z.length + OtherInfo.length);
        hashInput.set((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["uint32be"])(i), 0);
        hashInput.set(Z, 4);
        hashInput.set(OtherInfo, 4 + Z.length);
        const hashResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["digest"])('sha256', hashInput);
        dk.set(hashResult, (i - 1) * hashLen);
    }
    return dk.slice(0, dkLen);
}
async function ecdhesDeriveKey(publicKey, privateKey, algorithm, keyLength, apu = new Uint8Array(), apv = new Uint8Array()) {
    checkEcdhCryptoKey(publicKey);
    checkEcdhCryptoKey(privateKey, 'deriveBits');
    const algorithmID = lengthAndInput((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(algorithm));
    const partyUInfo = lengthAndInput(apu);
    const partyVInfo = lengthAndInput(apv);
    const suppPubInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["uint32be"])(keyLength);
    const suppPrivInfo = new Uint8Array();
    const otherInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["concat"])(algorithmID, partyUInfo, partyVInfo, suppPubInfo, suppPrivInfo);
    const Z = new Uint8Array(await crypto.subtle.deriveBits({
        name: publicKey.algorithm.name,
        public: publicKey
    }, privateKey, getEcdhBitLength(publicKey)));
    return concatKdf(Z, keyLength, otherInfo);
}
function getEcdhBitLength(publicKey) {
    if (publicKey.algorithm.name === 'X25519') {
        return 256;
    }
    return Math.ceil(parseInt(publicKey.algorithm.namedCurve.slice(-3), 10) / 8) << 3;
}
function ecdhesAllowed(key) {
    switch(key.algorithm.namedCurve){
        case 'P-256':
        case 'P-384':
        case 'P-521':
            return true;
        default:
            return key.algorithm.name === 'X25519';
    }
}
const unsupportedAlgHeader = 'Invalid or unsupported "alg" (JWE Algorithm) header value';
function assertEncryptedKey(encryptedKey) {
    if (encryptedKey === undefined) throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Encrypted Key missing');
}
async function decryptKeyManagement(alg, enc, key, encryptedKey, joseHeader, options) {
    switch(alg){
        case 'dir':
            {
                if (encryptedKey !== undefined) throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('Encountered unexpected JWE Encrypted Key');
                return key;
            }
        case 'ECDH-ES':
            if (encryptedKey !== undefined) throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('Encountered unexpected JWE Encrypted Key');
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW':
            {
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isObject"])(joseHeader.epk)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"](`JOSE Header "epk" (Ephemeral Public Key) missing or invalid`);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertCryptoKey"])(key);
                if (!ecdhesAllowed(key)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]('ECDH with the provided key is not allowed or not supported by your javascript runtime');
                const epk = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwk_to_key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jwkToKey"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweAlgorithm"])(alg), joseHeader.epk);
                let partyUInfo;
                let partyVInfo;
                if (joseHeader.apu !== undefined) {
                    if (typeof joseHeader.apu !== 'string') throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"](`JOSE Header "apu" (Agreement PartyUInfo) invalid`);
                    partyUInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64url"])(joseHeader.apu, 'apu', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]);
                }
                if (joseHeader.apv !== undefined) {
                    if (typeof joseHeader.apv !== 'string') throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"](`JOSE Header "apv" (Agreement PartyVInfo) invalid`);
                    partyVInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64url"])(joseHeader.apv, 'apv', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]);
                }
                const sharedSecret = await ecdhesDeriveKey(epk, key, alg === 'ECDH-ES' ? enc.alg : alg, alg === 'ECDH-ES' ? enc.cekBits : parseInt(alg.slice(-5, -2), 10), partyUInfo, partyVInfo);
                if (alg === 'ECDH-ES') return sharedSecret;
                assertEncryptedKey(encryptedKey);
                return aeskwUnwrap(alg.slice(-6), sharedSecret, encryptedKey);
            }
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            {
                assertEncryptedKey(encryptedKey);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertCryptoKey"])(key);
                return rsaesDecrypt(alg, key, encryptedKey);
            }
        case 'PBES2-HS256+A128KW':
        case 'PBES2-HS384+A192KW':
        case 'PBES2-HS512+A256KW':
            {
                assertEncryptedKey(encryptedKey);
                if (typeof joseHeader.p2c !== 'number') throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"](`JOSE Header "p2c" (PBES2 Count) missing or invalid`);
                const p2cLimit = options?.maxPBES2Count || 10_000;
                if (joseHeader.p2c > p2cLimit) throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"](`JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds`);
                if (typeof joseHeader.p2s !== 'string') throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"](`JOSE Header "p2s" (PBES2 Salt) missing or invalid`);
                let p2s;
                p2s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64url"])(joseHeader.p2s, 'p2s', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]);
                return pbes2kwUnwrap(alg, key, encryptedKey, joseHeader.p2c, p2s);
            }
        case 'A128KW':
        case 'A192KW':
        case 'A256KW':
            {
                assertEncryptedKey(encryptedKey);
                return aeskwUnwrap(alg, key, encryptedKey);
            }
        case 'A128GCMKW':
        case 'A192GCMKW':
        case 'A256GCMKW':
            {
                assertEncryptedKey(encryptedKey);
                if (typeof joseHeader.iv !== 'string') throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"](`JOSE Header "iv" (Initialization Vector) missing or invalid`);
                if (typeof joseHeader.tag !== 'string') throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"](`JOSE Header "tag" (Authentication Tag) missing or invalid`);
                let iv;
                iv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64url"])(joseHeader.iv, 'iv', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]);
                let tag;
                tag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64url"])(joseHeader.tag, 'tag', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]);
                return aesGcmKwUnwrap((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweEncryption"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweAlgorithm"])(alg).gcmkw), key, encryptedKey, iv, tag);
            }
        default:
            {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](unsupportedAlgHeader);
            }
    }
}
async function encryptKeyManagement(alg, enc, key, providedCek, providedParameters = {}) {
    let encryptedKey;
    let parameters;
    let cek;
    switch(alg){
        case 'dir':
            {
                cek = key;
                break;
            }
        case 'ECDH-ES':
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW':
            {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertCryptoKey"])(key);
                if (!ecdhesAllowed(key)) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]('ECDH with the provided key is not allowed or not supported by your javascript runtime');
                }
                const { apu, apv } = providedParameters;
                let ephemeralKey;
                if (providedParameters.epk) {
                    ephemeralKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["prepareKey"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweAlgorithm"])(alg), providedParameters.epk, 'decrypt');
                } else {
                    ephemeralKey = (await crypto.subtle.generateKey(key.algorithm, true, [
                        'deriveBits'
                    ])).privateKey;
                }
                const subtle = crypto.subtle;
                let exportableEpk = ephemeralKey;
                if (!exportableEpk.extractable) {
                    if (typeof subtle.getPublicKey !== 'function') {
                        throw new TypeError('CryptoKey for "epk" must be extractable');
                    }
                    exportableEpk = await subtle.getPublicKey(ephemeralKey, []);
                }
                const { x, y, crv, kty } = await subtle.exportKey('jwk', exportableEpk);
                const sharedSecret = await ecdhesDeriveKey(key, ephemeralKey, alg === 'ECDH-ES' ? enc.alg : alg, alg === 'ECDH-ES' ? enc.cekBits : parseInt(alg.slice(-5, -2), 10), apu, apv);
                parameters = {
                    epk: {
                        x,
                        crv,
                        kty
                    }
                };
                if (kty === 'EC') parameters.epk.y = y;
                if (apu) parameters.apu = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(apu);
                if (apv) parameters.apv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(apv);
                if (alg === 'ECDH-ES') {
                    cek = sharedSecret;
                    break;
                }
                cek = providedCek || (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["generateCek"])(enc);
                const kwAlg = alg.slice(-6);
                encryptedKey = await aeskwWrap(kwAlg, sharedSecret, cek);
                break;
            }
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            {
                cek = providedCek || (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["generateCek"])(enc);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertCryptoKey"])(key);
                encryptedKey = await rsaesEncrypt(alg, key, cek);
                break;
            }
        case 'PBES2-HS256+A128KW':
        case 'PBES2-HS384+A192KW':
        case 'PBES2-HS512+A256KW':
            {
                cek = providedCek || (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["generateCek"])(enc);
                const { p2c, p2s } = providedParameters;
                ({ encryptedKey, ...parameters } = await pbes2kwWrap(alg, key, cek, p2c, p2s));
                break;
            }
        case 'A128KW':
        case 'A192KW':
        case 'A256KW':
            {
                cek = providedCek || (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["generateCek"])(enc);
                encryptedKey = await aeskwWrap(alg, key, cek);
                break;
            }
        case 'A128GCMKW':
        case 'A192GCMKW':
        case 'A256GCMKW':
            {
                cek = providedCek || (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["generateCek"])(enc);
                const { iv } = providedParameters;
                ({ encryptedKey, ...parameters } = await aesGcmKwWrap((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweEncryption"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweAlgorithm"])(alg).gcmkw), key, cek, iv));
                break;
            }
        default:
            {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](unsupportedAlgHeader);
            }
    }
    return {
        cek,
        encryptedKey,
        parameters
    };
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/options.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JWE_RECOGNIZED",
    ()=>JWE_RECOGNIZED,
    "JWS_RECOGNIZED",
    ()=>JWS_RECOGNIZED,
    "validateAlgorithms",
    ()=>validateAlgorithms,
    "validateCrit",
    ()=>validateCrit,
    "validateCritDuplicates",
    ()=>validateCritDuplicates
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
;
const JWS_RECOGNIZED = new Map([
    [
        'b64',
        true
    ]
]);
const JWE_RECOGNIZED = new Map();
function validateAlgorithms(option, algorithms) {
    if (algorithms !== undefined && (!Array.isArray(algorithms) || algorithms.some((s)=>typeof s !== 'string'))) {
        throw new TypeError(`"${option}" option must be an array of strings`);
    }
    if (!algorithms) {
        return undefined;
    }
    return new Set(algorithms);
}
function validateCritDuplicates(Err, protectedHeader) {
    const { crit } = protectedHeader ?? {};
    if (Array.isArray(crit) && new Set(crit).size !== crit.length) {
        throw new Err('"crit" (Critical) Header Parameter MUST NOT contain duplicate values');
    }
}
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
    if (joseHeader.crit !== undefined && protectedHeader?.crit === undefined) {
        throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
    }
    if (!protectedHeader || protectedHeader.crit === undefined) {
        return new Set();
    }
    if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input)=>typeof input !== 'string' || input.length === 0)) {
        throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
    }
    let recognized;
    if (recognizedOption !== undefined) {
        recognized = new Map([
            ...Object.entries(recognizedOption),
            ...recognizedDefault.entries()
        ]);
    } else {
        recognized = recognizedDefault;
    }
    for (const parameter of protectedHeader.crit){
        if (!recognized.has(parameter)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](`Extension Header Parameter "${parameter}" is not recognized`);
        }
        if (joseHeader[parameter] === undefined) {
            throw new Err(`Extension Header Parameter "${parameter}" is missing`);
        }
        if (recognized.get(parameter) && protectedHeader[parameter] === undefined) {
            throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
        }
    }
    return new Set(protectedHeader.crit);
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/deflate.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compress",
    ()=>compress,
    "decompress",
    ()=>decompress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
;
;
function supported(name) {
    if (typeof globalThis[name] === 'undefined') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](`JWE "zip" (Compression Algorithm) Header Parameter requires the ${name} API.`);
    }
}
async function compress(input) {
    supported('CompressionStream');
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    writer.write(input).catch(()=>{});
    writer.close().catch(()=>{});
    const chunks = [];
    const reader = cs.readable.getReader();
    for(;;){
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["concat"])(...chunks);
}
async function decompress(input, maxLength) {
    supported('DecompressionStream');
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(input).catch(()=>{});
    writer.close().catch(()=>{});
    const chunks = [];
    let length = 0;
    const reader = ds.readable.getReader();
    for(;;){
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(value);
        length += value.byteLength;
        if (maxLength !== Infinity && length > maxLength) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('Decompressed plaintext exceeded the configured limit');
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["concat"])(...chunks);
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwe_encrypt.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkEncryptHeaders",
    ()=>checkEncryptHeaders,
    "createJWE",
    ()=>createJWE,
    "encryptJWE",
    ()=>encryptJWE
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/content_encryption.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key_management$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/key_management.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$options$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/options.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/key.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwe_algorithms.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$deflate$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/deflate.js [middleware-edge] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
function checkEncryptHeaders(input) {
    const { protectedHeader, unprotectedHeader, sharedUnprotectedHeader } = input;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isDisjoint"])(protectedHeader, unprotectedHeader, sharedUnprotectedHeader)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint');
    }
    const joseHeader = {
        ...protectedHeader,
        ...unprotectedHeader,
        ...sharedUnprotectedHeader
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$options$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["validateCrit"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"], __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$options$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWE_RECOGNIZED"], input.crit, protectedHeader, joseHeader);
    if (joseHeader.zip !== undefined && joseHeader.zip !== 'DEF') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value.');
    }
    if (joseHeader.zip !== undefined && !protectedHeader?.zip) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE "zip" (Compression Algorithm) Header Parameter MUST be in a protected header.');
    }
    const { alg, enc } = joseHeader;
    if (typeof alg !== 'string' || !alg) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE "alg" (Algorithm) Header Parameter missing or invalid');
    }
    if (typeof enc !== 'string' || !enc) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
    }
    return {
        joseHeader,
        alg,
        enc,
        encEntry: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweEncryption"])(enc)
    };
}
async function encryptJWE(input, checked, key) {
    const { joseHeader, alg, encEntry } = checked;
    let { protectedHeader, unprotectedHeader } = input;
    const { sharedUnprotectedHeader } = input;
    if (input.cek && (alg === 'dir' || alg === 'ECDH-ES')) {
        throw new TypeError(`setContentEncryptionKey cannot be called with JWE "alg" (Algorithm) Header ${alg}`);
    }
    const algEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweAlgorithm"])(alg);
    const k = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["prepareKey"])(alg === 'dir' ? encEntry : algEntry, key, 'encrypt');
    const { cek, encryptedKey, parameters } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key_management$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encryptKeyManagement"])(alg, encEntry, k, input.cek, input.keyManagementParameters);
    if (parameters) {
        if (input.unprotectedParameters) {
            unprotectedHeader = unprotectedHeader ? {
                ...unprotectedHeader,
                ...parameters
            } : parameters;
        } else {
            protectedHeader = protectedHeader ? {
                ...protectedHeader,
                ...parameters
            } : parameters;
        }
    }
    let protectedHeaderS;
    let protectedHeaderB;
    if (protectedHeader) {
        protectedHeaderS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(JSON.stringify(protectedHeader));
        protectedHeaderB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(protectedHeaderS);
    } else {
        protectedHeaderS = '';
        protectedHeaderB = new Uint8Array();
    }
    let additionalData;
    let aadMember;
    if (input.aad?.byteLength) {
        aadMember = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(input.aad);
        additionalData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["concat"])(protectedHeaderB, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])('.'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(aadMember));
    } else {
        additionalData = protectedHeaderB;
    }
    let plaintext = input.plaintext;
    if (joseHeader.zip === 'DEF') {
        plaintext = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$deflate$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["compress"])(plaintext).catch((cause)=>{
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('Failed to compress plaintext', {
                cause
            });
        });
    }
    const { ciphertext, tag, iv } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encrypt"])(encEntry, plaintext, cek, input.iv, additionalData);
    const jwe = {
        ciphertext: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(ciphertext)
    };
    if (iv) {
        jwe.iv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(iv);
    }
    if (tag) {
        jwe.tag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(tag);
    }
    if (encryptedKey) {
        jwe.encrypted_key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(encryptedKey);
    }
    if (aadMember) {
        jwe.aad = aadMember;
    }
    if (protectedHeader) {
        jwe.protected = protectedHeaderS;
    }
    if (sharedUnprotectedHeader) {
        jwe.unprotected = sharedUnprotectedHeader;
    }
    if (unprotectedHeader) {
        jwe.header = unprotectedHeader;
    }
    return jwe;
}
async function createJWE(input, key) {
    return encryptJWE(input, checkEncryptHeaders(input), key);
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/jwe/flattened/encrypt.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FlattenedEncrypt",
    ()=>FlattenedEncrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/helpers.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_encrypt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwe_encrypt.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$options$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/options.js [middleware-edge] (ecmascript)");
;
;
;
;
class FlattenedEncrypt {
    #plaintext;
    #protectedHeader;
    #sharedUnprotectedHeader;
    #unprotectedHeader;
    #aad;
    #cek;
    #iv;
    #keyManagementParameters;
    constructor(plaintext){
        if (!(plaintext instanceof Uint8Array)) {
            throw new TypeError('plaintext must be an instance of Uint8Array');
        }
        this.#plaintext = plaintext;
    }
    setKeyManagementParameters(parameters) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertNotSet"])(this.#keyManagementParameters, 'setKeyManagementParameters');
        this.#keyManagementParameters = parameters;
        return this;
    }
    setProtectedHeader(protectedHeader) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertNotSet"])(this.#protectedHeader, 'setProtectedHeader');
        this.#protectedHeader = protectedHeader;
        return this;
    }
    setSharedUnprotectedHeader(sharedUnprotectedHeader) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertNotSet"])(this.#sharedUnprotectedHeader, 'setSharedUnprotectedHeader');
        this.#sharedUnprotectedHeader = sharedUnprotectedHeader;
        return this;
    }
    setUnprotectedHeader(unprotectedHeader) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertNotSet"])(this.#unprotectedHeader, 'setUnprotectedHeader');
        this.#unprotectedHeader = unprotectedHeader;
        return this;
    }
    setAdditionalAuthenticatedData(aad) {
        this.#aad = aad;
        return this;
    }
    setContentEncryptionKey(cek) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertNotSet"])(this.#cek, 'setContentEncryptionKey');
        this.#cek = cek;
        return this;
    }
    setInitializationVector(iv) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertNotSet"])(this.#iv, 'setInitializationVector');
        this.#iv = iv;
        return this;
    }
    async encrypt(key, options) {
        if (!this.#protectedHeader && !this.#unprotectedHeader && !this.#sharedUnprotectedHeader) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()');
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$options$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["validateCritDuplicates"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"], this.#protectedHeader);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_encrypt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createJWE"])({
            plaintext: this.#plaintext,
            protectedHeader: this.#protectedHeader,
            unprotectedHeader: this.#unprotectedHeader,
            sharedUnprotectedHeader: this.#sharedUnprotectedHeader,
            aad: this.#aad,
            cek: this.#cek,
            iv: this.#iv,
            keyManagementParameters: this.#keyManagementParameters,
            crit: options?.crit,
            unprotectedParameters: options ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["unprotected"] in options : false
        }, key);
    }
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/jwe/compact/encrypt.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CompactEncrypt",
    ()=>CompactEncrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwe$2f$flattened$2f$encrypt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/jwe/flattened/encrypt.js [middleware-edge] (ecmascript)");
;
class CompactEncrypt {
    #flattened;
    constructor(plaintext){
        this.#flattened = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwe$2f$flattened$2f$encrypt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["FlattenedEncrypt"](plaintext);
    }
    setContentEncryptionKey(cek) {
        this.#flattened.setContentEncryptionKey(cek);
        return this;
    }
    setInitializationVector(iv) {
        this.#flattened.setInitializationVector(iv);
        return this;
    }
    setProtectedHeader(protectedHeader) {
        this.#flattened.setProtectedHeader(protectedHeader);
        return this;
    }
    setKeyManagementParameters(parameters) {
        this.#flattened.setKeyManagementParameters(parameters);
        return this;
    }
    async encrypt(key, options) {
        const jwe = await this.#flattened.encrypt(key, options);
        return [
            jwe.protected,
            jwe.encrypted_key,
            jwe.iv,
            jwe.ciphertext,
            jwe.tag
        ].join('.');
    }
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwt_claims_set.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JWTClaimsBuilder",
    ()=>JWTClaimsBuilder,
    "secs",
    ()=>secs,
    "validateClaimsSet",
    ()=>validateClaimsSet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
;
;
;
const epoch = (date)=>Math.floor(date.getTime() / 1000);
const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const year = day * 365.25;
const REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
function secs(str) {
    const matched = REGEX.exec(str);
    if (!matched || matched[4] && matched[1]) {
        throw new TypeError('Invalid time period format');
    }
    const value = parseFloat(matched[2]);
    const unit = matched[3].toLowerCase();
    let numericDate;
    switch(unit){
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
        case 's':
            numericDate = Math.round(value);
            break;
        case 'minute':
        case 'minutes':
        case 'min':
        case 'mins':
        case 'm':
            numericDate = Math.round(value * minute);
            break;
        case 'hour':
        case 'hours':
        case 'hr':
        case 'hrs':
        case 'h':
            numericDate = Math.round(value * hour);
            break;
        case 'day':
        case 'days':
        case 'd':
            numericDate = Math.round(value * day);
            break;
        case 'week':
        case 'weeks':
        case 'w':
            numericDate = Math.round(value * week);
            break;
        default:
            numericDate = Math.round(value * year);
            break;
    }
    if (matched[1] === '-' || matched[4] === 'ago') {
        return -numericDate;
    }
    return numericDate;
}
function validateInput(label, input) {
    if (!Number.isFinite(input)) {
        throw new TypeError(`Invalid ${label} input`);
    }
    return input;
}
const normalizeTyp = (value)=>{
    if (value.includes('/')) {
        return value.toLowerCase();
    }
    return `application/${value.toLowerCase()}`;
};
const checkAudiencePresence = (audPayload, audOption)=>{
    if (typeof audPayload === 'string') {
        return audOption.includes(audPayload);
    }
    if (Array.isArray(audPayload)) {
        return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
    }
    return false;
};
function validateClaimsSet(protectedHeader, encodedPayload, options = {}) {
    let payload;
    try {
        payload = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["strictDecoder"].decode(encodedPayload));
    } catch  {}
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isObject"])(payload)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTInvalid"]('JWT Claims Set must be a top-level JSON object');
    }
    const { typ } = options;
    if (typ && (typeof protectedHeader.typ !== 'string' || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('unexpected "typ" JWT header value', payload, 'typ', 'check_failed');
    }
    const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
    const presenceCheck = [
        ...requiredClaims
    ];
    if (maxTokenAge !== undefined) presenceCheck.push('iat');
    if (audience !== undefined) presenceCheck.push('aud');
    if (subject !== undefined) presenceCheck.push('sub');
    if (issuer !== undefined) presenceCheck.push('iss');
    for (const claim of new Set(presenceCheck.reverse())){
        if (!(claim in payload)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"](`missing required "${claim}" claim`, payload, claim, 'missing');
        }
    }
    if (issuer !== undefined && !(Array.isArray(issuer) ? issuer : [
        issuer
    ]).includes(payload.iss)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('unexpected "iss" claim value', payload, 'iss', 'check_failed');
    }
    if (subject !== undefined && payload.sub !== subject) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('unexpected "sub" claim value', payload, 'sub', 'check_failed');
    }
    if (audience !== undefined && !checkAudiencePresence(payload.aud, typeof audience === 'string' ? [
        audience
    ] : audience)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('unexpected "aud" claim value', payload, 'aud', 'check_failed');
    }
    let tolerance;
    switch(typeof options.clockTolerance){
        case 'string':
            tolerance = secs(options.clockTolerance);
            break;
        case 'number':
            tolerance = options.clockTolerance;
            break;
        case 'undefined':
            tolerance = 0;
            break;
        default:
            throw new TypeError('Invalid clockTolerance option type');
    }
    validateInput('clockTolerance option', tolerance);
    const { currentDate } = options;
    const now = validateInput('currentDate option', epoch(currentDate || new Date()));
    if ((payload.iat !== undefined || maxTokenAge !== undefined) && typeof payload.iat !== 'number') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"iat" claim must be a number', payload, 'iat', 'invalid');
    }
    if (payload.nbf !== undefined) {
        if (typeof payload.nbf !== 'number') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"nbf" claim must be a number', payload, 'nbf', 'invalid');
        }
        if (payload.nbf > now + tolerance) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"nbf" claim timestamp check failed', payload, 'nbf', 'check_failed');
        }
    }
    if (payload.exp !== undefined) {
        if (typeof payload.exp !== 'number') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"exp" claim must be a number', payload, 'exp', 'invalid');
        }
        if (payload.exp <= now - tolerance) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTExpired"]('"exp" claim timestamp check failed', payload, 'exp', 'check_failed');
        }
    }
    if (maxTokenAge !== undefined) {
        const age = now - payload.iat;
        const max = typeof maxTokenAge === 'number' ? maxTokenAge : secs(maxTokenAge);
        if (age - tolerance > max) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTExpired"]('"iat" claim timestamp check failed (too far in the past)', payload, 'iat', 'check_failed');
        }
        if (age < 0 - tolerance) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"iat" claim timestamp check failed (it should be in the past)', payload, 'iat', 'check_failed');
        }
    }
    return payload;
}
class JWTClaimsBuilder {
    #payload;
    constructor(payload){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isObject"])(payload)) {
            throw new TypeError('JWT Claims Set MUST be an object');
        }
        this.#payload = structuredClone(payload);
    }
    data() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encoder"].encode(JSON.stringify(this.#payload));
    }
    get iss() {
        return this.#payload.iss;
    }
    set iss(value) {
        this.#payload.iss = value;
    }
    get sub() {
        return this.#payload.sub;
    }
    set sub(value) {
        this.#payload.sub = value;
    }
    get aud() {
        return this.#payload.aud;
    }
    set aud(value) {
        this.#payload.aud = value;
    }
    set jti(value) {
        this.#payload.jti = value;
    }
    set nbf(value) {
        if (typeof value === 'number') {
            this.#payload.nbf = validateInput('setNotBefore', value);
        } else if (value instanceof Date) {
            this.#payload.nbf = validateInput('setNotBefore', epoch(value));
        } else {
            this.#payload.nbf = epoch(new Date()) + secs(value);
        }
    }
    set exp(value) {
        if (typeof value === 'number') {
            this.#payload.exp = validateInput('setExpirationTime', value);
        } else if (value instanceof Date) {
            this.#payload.exp = validateInput('setExpirationTime', epoch(value));
        } else {
            this.#payload.exp = epoch(new Date()) + secs(value);
        }
    }
    set iat(value) {
        if (value === undefined) {
            this.#payload.iat = epoch(new Date());
        } else if (value instanceof Date) {
            this.#payload.iat = validateInput('setIssuedAt', epoch(value));
        } else if (typeof value === 'string') {
            this.#payload.iat = validateInput('setIssuedAt', epoch(new Date()) + secs(value));
        } else {
            this.#payload.iat = validateInput('setIssuedAt', value);
        }
    }
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/jwt/encrypt.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EncryptJWT",
    ()=>EncryptJWT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwe$2f$compact$2f$encrypt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/jwe/compact/encrypt.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwt_claims_set$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwt_claims_set.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/helpers.js [middleware-edge] (ecmascript)");
;
;
;
class EncryptJWT {
    #cek;
    #iv;
    #keyManagementParameters;
    #protectedHeader;
    #replicateIssuerAsHeader;
    #replicateSubjectAsHeader;
    #replicateAudienceAsHeader;
    #jwt;
    constructor(payload = {}){
        this.#jwt = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwt_claims_set$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimsBuilder"](payload);
    }
    setIssuer(issuer) {
        this.#jwt.iss = issuer;
        return this;
    }
    setSubject(subject) {
        this.#jwt.sub = subject;
        return this;
    }
    setAudience(audience) {
        this.#jwt.aud = audience;
        return this;
    }
    setJti(jwtId) {
        this.#jwt.jti = jwtId;
        return this;
    }
    setNotBefore(input) {
        this.#jwt.nbf = input;
        return this;
    }
    setExpirationTime(input) {
        this.#jwt.exp = input;
        return this;
    }
    setIssuedAt(input) {
        this.#jwt.iat = input;
        return this;
    }
    setProtectedHeader(protectedHeader) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertNotSet"])(this.#protectedHeader, 'setProtectedHeader');
        this.#protectedHeader = protectedHeader;
        return this;
    }
    setKeyManagementParameters(parameters) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertNotSet"])(this.#keyManagementParameters, 'setKeyManagementParameters');
        this.#keyManagementParameters = parameters;
        return this;
    }
    setContentEncryptionKey(cek) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertNotSet"])(this.#cek, 'setContentEncryptionKey');
        this.#cek = cek;
        return this;
    }
    setInitializationVector(iv) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["assertNotSet"])(this.#iv, 'setInitializationVector');
        this.#iv = iv;
        return this;
    }
    replicateIssuerAsHeader() {
        this.#replicateIssuerAsHeader = true;
        return this;
    }
    replicateSubjectAsHeader() {
        this.#replicateSubjectAsHeader = true;
        return this;
    }
    replicateAudienceAsHeader() {
        this.#replicateAudienceAsHeader = true;
        return this;
    }
    async encrypt(key, options) {
        const enc = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwe$2f$compact$2f$encrypt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["CompactEncrypt"](this.#jwt.data());
        if (this.#protectedHeader && (this.#replicateIssuerAsHeader || this.#replicateSubjectAsHeader || this.#replicateAudienceAsHeader)) {
            this.#protectedHeader = {
                ...this.#protectedHeader,
                iss: this.#replicateIssuerAsHeader ? this.#jwt.iss : undefined,
                sub: this.#replicateSubjectAsHeader ? this.#jwt.sub : undefined,
                aud: this.#replicateAudienceAsHeader ? this.#jwt.aud : undefined
            };
        }
        enc.setProtectedHeader(this.#protectedHeader);
        if (this.#iv) {
            enc.setInitializationVector(this.#iv);
        }
        if (this.#cek) {
            enc.setContentEncryptionKey(this.#cek);
        }
        if (this.#keyManagementParameters) {
            enc.setKeyManagementParameters(this.#keyManagementParameters);
        }
        return enc.encrypt(key, options);
    }
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript) <export * as base64url>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "base64url",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)");
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jws_algorithms.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jwsAlgorithm",
    ()=>jwsAlgorithm,
    "maybeJWSAlgorithm",
    ()=>maybeJWSAlgorithm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key_descriptor$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/key_descriptor.js [middleware-edge] (ecmascript)");
;
;
const sig = {
    public: [
        'verify'
    ],
    private: [
        'sign'
    ]
};
function hmac(bits) {
    const subtle = {
        name: 'HMAC',
        hash: `SHA-${bits}`
    };
    return {
        kty: [
            'oct'
        ],
        symmetric: true,
        subtle,
        operation: subtle,
        usages: sig
    };
}
function rsa(name, bits, saltLength) {
    const subtle = {
        name,
        hash: `SHA-${bits}`
    };
    return {
        kty: [
            'RSA'
        ],
        subtle,
        operation: saltLength ? {
            ...subtle,
            saltLength
        } : subtle,
        usages: sig,
        minModulusLength: 2048
    };
}
function ecdsa(crv, bits) {
    return {
        kty: [
            'EC'
        ],
        crv,
        subtle: {
            name: 'ECDSA',
            namedCurve: crv
        },
        operation: {
            name: 'ECDSA',
            hash: `SHA-${bits}`
        },
        usages: sig
    };
}
function eddsa() {
    const subtle = {
        name: 'Ed25519'
    };
    return {
        kty: [
            'OKP'
        ],
        crv: 'Ed25519',
        subtle,
        operation: subtle,
        usages: sig
    };
}
function mldsa(name) {
    const subtle = {
        name
    };
    return {
        kty: [
            'AKP'
        ],
        subtle,
        operation: subtle,
        usages: sig
    };
}
const JWS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key_descriptor$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["table"])({
    HS256: hmac(256),
    HS384: hmac(384),
    HS512: hmac(512),
    RS256: rsa('RSASSA-PKCS1-v1_5', 256),
    RS384: rsa('RSASSA-PKCS1-v1_5', 384),
    RS512: rsa('RSASSA-PKCS1-v1_5', 512),
    PS256: rsa('RSA-PSS', 256, 32),
    PS384: rsa('RSA-PSS', 384, 48),
    PS512: rsa('RSA-PSS', 512, 64),
    ES256: ecdsa('P-256', 256),
    ES384: ecdsa('P-384', 384),
    ES512: ecdsa('P-521', 512),
    EdDSA: eddsa(),
    Ed25519: eddsa(),
    'ML-DSA-44': mldsa('ML-DSA-44'),
    'ML-DSA-65': mldsa('ML-DSA-65'),
    'ML-DSA-87': mldsa('ML-DSA-87')
});
function jwsAlgorithm(alg) {
    const entry = JWS[alg];
    if (!entry) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"](`alg ${alg} is not supported either by JOSE or your javascript runtime`);
    }
    return entry;
}
function maybeJWSAlgorithm(alg) {
    return JWS[alg];
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/key_algorithm.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "keyAlgorithm",
    ()=>keyAlgorithm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jws_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jws_algorithms.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwe_algorithms.js [middleware-edge] (ecmascript)");
;
;
;
function unsupportedAlgorithm() {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
}
function keyAlgorithm(alg) {
    if (typeof alg !== 'string') {
        throw unsupportedAlgorithm();
    }
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jws_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["maybeJWSAlgorithm"])(alg) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["maybeJWEAlgorithm"])(alg);
    if (!entry) {
        throw unsupportedAlgorithm();
    }
    return entry;
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/asn1.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromPKCS8",
    ()=>fromPKCS8,
    "fromSPKI",
    ()=>fromSPKI,
    "fromX509",
    ()=>fromX509,
    "toPKCS8",
    ()=>toPKCS8,
    "toSPKI",
    ()=>toSPKI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/invalid_key_input.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$base64$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/base64.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key_algorithm$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/key_algorithm.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/is_key_like.js [middleware-edge] (ecmascript)");
;
;
;
;
;
const formatPEM = (b64, descriptor)=>{
    const newlined = (b64.match(/.{1,64}/g) || []).join('\n');
    return `-----BEGIN ${descriptor}-----\n${newlined}\n-----END ${descriptor}-----`;
};
const genericExport = async (keyType, keyFormat, key)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isKeyObject"])(key)) {
        if (key.type !== keyType) {
            throw new TypeError(`key is not a ${keyType} key`);
        }
        return key.export({
            format: 'pem',
            type: keyFormat
        });
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isCryptoKey"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["invalidKeyInput"])(key, 'CryptoKey', 'KeyObject'));
    }
    if (!key.extractable) {
        throw new TypeError('CryptoKey is not extractable');
    }
    if (key.type !== keyType) {
        throw new TypeError(`key is not a ${keyType} key`);
    }
    return formatPEM((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$base64$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encodeBase64"])(new Uint8Array(await crypto.subtle.exportKey(keyFormat, key))), `${keyType.toUpperCase()} KEY`);
};
const toSPKI = (key)=>genericExport('public', 'spki', key);
const toPKCS8 = (key)=>genericExport('private', 'pkcs8', key);
const bytesEqual = (a, b)=>{
    if (a.byteLength !== b.length) return false;
    for(let i = 0; i < a.byteLength; i++){
        if (a[i] !== b[i]) return false;
    }
    return true;
};
const createASN1State = (data)=>({
        data,
        pos: 0
    });
const readByte = (state)=>{
    const byte = state.data[state.pos++];
    if (byte === undefined) {
        throw new Error('Unexpected end of ASN.1 input');
    }
    return byte;
};
const parseLength = (state)=>{
    const first = readByte(state);
    if (first & 0x80) {
        const lengthOfLen = first & 0x7f;
        let length = 0;
        for(let i = 0; i < lengthOfLen; i++){
            length = length << 8 | readByte(state);
        }
        return length;
    }
    return first;
};
const skipElement = (state, count = 1)=>{
    if (count <= 0) return;
    state.pos++;
    const length = parseLength(state);
    state.pos += length;
    if (count > 1) {
        skipElement(state, count - 1);
    }
};
const expectTag = (state, expectedTag, errorMessage)=>{
    if (readByte(state) !== expectedTag) {
        throw new Error(errorMessage);
    }
};
const getSubarray = (state, length)=>{
    if (length < 0 || state.pos + length > state.data.length) {
        throw new Error('Unexpected end of ASN.1 input');
    }
    const result = state.data.subarray(state.pos, state.pos + length);
    state.pos += length;
    return result;
};
const parseAlgorithmOID = (state)=>{
    expectTag(state, 0x06, 'Expected algorithm OID');
    const oidLen = parseLength(state);
    return getSubarray(state, oidLen);
};
function parsePKCS8Header(state) {
    expectTag(state, 0x30, 'Invalid PKCS#8 structure');
    parseLength(state);
    expectTag(state, 0x02, 'Expected version field');
    const verLen = parseLength(state);
    state.pos += verLen;
    expectTag(state, 0x30, 'Expected algorithm identifier');
    const algIdLen = parseLength(state);
    const algIdStart = state.pos;
    return {
        algIdStart,
        algIdLength: algIdLen
    };
}
function parseSPKIHeader(state) {
    expectTag(state, 0x30, 'Invalid SPKI structure');
    parseLength(state);
    expectTag(state, 0x30, 'Expected algorithm identifier');
    const algIdLen = parseLength(state);
    const algIdStart = state.pos;
    return {
        algIdStart,
        algIdLength: algIdLen
    };
}
const parseECAlgorithmIdentifier = (state)=>{
    const algOid = parseAlgorithmOID(state);
    if (bytesEqual(algOid, [
        0x2b,
        0x65,
        0x6e
    ])) {
        return 'X25519';
    }
    if (!bytesEqual(algOid, [
        0x2a,
        0x86,
        0x48,
        0xce,
        0x3d,
        0x02,
        0x01
    ])) {
        throw new Error('Unsupported key algorithm');
    }
    expectTag(state, 0x06, 'Expected curve OID');
    const curveOidLen = parseLength(state);
    const curveOid = getSubarray(state, curveOidLen);
    for (const { name, oid } of [
        {
            name: 'P-256',
            oid: [
                0x2a,
                0x86,
                0x48,
                0xce,
                0x3d,
                0x03,
                0x01,
                0x07
            ]
        },
        {
            name: 'P-384',
            oid: [
                0x2b,
                0x81,
                0x04,
                0x00,
                0x22
            ]
        },
        {
            name: 'P-521',
            oid: [
                0x2b,
                0x81,
                0x04,
                0x00,
                0x23
            ]
        }
    ]){
        if (bytesEqual(curveOid, oid)) {
            return name;
        }
    }
    throw new Error('Unsupported named curve');
};
const genericImport = async (keyFormat, keyData, alg, options)=>{
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key_algorithm$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["keyAlgorithm"])(alg);
    if (entry.symmetric) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported "alg" (Algorithm) value');
    }
    const isPublic = keyFormat === 'spki';
    let algorithm;
    if (entry.subtleFor) {
        try {
            algorithm = entry.subtleFor({
                crv: options.getNamedCurve(keyData)
            });
        } catch (cause) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported key format');
        }
    } else {
        algorithm = entry.subtle;
    }
    return crypto.subtle.importKey(keyFormat, keyData, algorithm, options?.extractable ?? (isPublic ? true : false), isPublic ? entry.usages.public : entry.usages.private);
};
const processPEMData = (pem, pattern)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$base64$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64"])(pem.replace(pattern, ''));
};
const fromPKCS8 = (pem, alg, options)=>{
    const keyData = processPEMData(pem, /(?:-----(?:BEGIN|END) PRIVATE KEY-----|\s)/g);
    let opts = options;
    if (alg?.startsWith?.('ECDH-ES')) {
        opts ||= {};
        opts.getNamedCurve = (keyData)=>{
            const state = createASN1State(keyData);
            parsePKCS8Header(state);
            return parseECAlgorithmIdentifier(state);
        };
    }
    return genericImport('pkcs8', keyData, alg, opts);
};
const fromSPKI = (pem, alg, options)=>{
    const keyData = processPEMData(pem, /(?:-----(?:BEGIN|END) PUBLIC KEY-----|\s)/g);
    let opts = options;
    if (alg?.startsWith?.('ECDH-ES')) {
        opts ||= {};
        opts.getNamedCurve = (keyData)=>{
            const state = createASN1State(keyData);
            parseSPKIHeader(state);
            return parseECAlgorithmIdentifier(state);
        };
    }
    return genericImport('spki', keyData, alg, opts);
};
function spkiFromX509(buf) {
    const state = createASN1State(buf);
    expectTag(state, 0x30, 'Invalid certificate structure');
    parseLength(state);
    expectTag(state, 0x30, 'Invalid tbsCertificate structure');
    parseLength(state);
    if (buf[state.pos] === 0xa0) {
        skipElement(state, 6);
    } else {
        skipElement(state, 5);
    }
    const spkiStart = state.pos;
    expectTag(state, 0x30, 'Invalid SPKI structure');
    const spkiContentLen = parseLength(state);
    return buf.subarray(spkiStart, spkiStart + spkiContentLen + (state.pos - spkiStart));
}
function extractX509SPKI(x509) {
    const derBytes = processPEMData(x509, /(?:-----(?:BEGIN|END) CERTIFICATE-----|\s)/g);
    return spkiFromX509(derBytes);
}
const fromX509 = (pem, alg, options)=>{
    let spki;
    try {
        spki = extractX509SPKI(pem);
    } catch (cause) {
        throw new TypeError('Failed to parse the X.509 certificate', {
            cause
        });
    }
    return fromSPKI(formatPEM((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$base64$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encodeBase64"])(spki), 'PUBLIC KEY'), alg, options);
};
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/key/export.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportJWK",
    ()=>exportJWK,
    "exportPKCS8",
    ()=>exportPKCS8,
    "exportSPKI",
    ()=>exportSPKI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$asn1$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/asn1.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/invalid_key_input.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/is_key_like.js [middleware-edge] (ecmascript)");
;
;
;
;
function omitUndefinedProperties(jwk) {
    return Object.fromEntries(Object.entries(jwk).filter(([, value])=>value !== undefined));
}
async function keyToJWK(key) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isKeyObject"])(key)) {
        if (key.type === 'secret') {
            key = key.export();
        } else {
            return key.export({
                format: 'jwk'
            });
        }
    }
    if (key instanceof Uint8Array) {
        return {
            kty: 'oct',
            k: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(key)
        };
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isCryptoKey"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["invalidKeyInput"])(key, 'CryptoKey', 'KeyObject', 'Uint8Array'));
    }
    if (!key.extractable) {
        throw new TypeError('non-extractable CryptoKey cannot be exported as a JWK');
    }
    const { ext, key_ops, alg, use, ...jwk } = omitUndefinedProperties(await crypto.subtle.exportKey('jwk', key));
    if (jwk.kty === 'AKP') {
        ;
        jwk.alg = alg;
    }
    return jwk;
}
async function exportSPKI(key) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$asn1$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["toSPKI"])(key);
}
async function exportPKCS8(key) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$asn1$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["toPKCS8"])(key);
}
async function exportJWK(key) {
    return keyToJWK(key);
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/jwk/thumbprint.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateJwkThumbprint",
    ()=>calculateJwkThumbprint,
    "calculateJwkThumbprintUri",
    ()=>calculateJwkThumbprintUri
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/helpers.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/is_key_like.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$key$2f$export$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/key/export.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/invalid_key_input.js [middleware-edge] (ecmascript)");
;
;
;
;
;
;
;
;
const check = (value, description)=>{
    if (typeof value !== 'string' || !value) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWKInvalid"](`${description} missing or invalid`);
    }
};
async function calculateJwkThumbprint(key, digestAlgorithm) {
    let jwk;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isJWK"])(key)) {
        jwk = key;
    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$is_key_like$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isKeyLike"])(key)) {
        jwk = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$key$2f$export$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["exportJWK"])(key);
    } else {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$invalid_key_input$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["invalidKeyInput"])(key, 'CryptoKey', 'KeyObject', 'JSON Web Key'));
    }
    digestAlgorithm ??= 'sha256';
    if (digestAlgorithm !== 'sha256' && digestAlgorithm !== 'sha384' && digestAlgorithm !== 'sha512') {
        throw new TypeError('digestAlgorithm must one of "sha256", "sha384", or "sha512"');
    }
    let components;
    switch(jwk.kty){
        case 'AKP':
            check(jwk.alg, '"alg" (Algorithm) Parameter');
            check(jwk.pub, '"pub" (Public key) Parameter');
            components = {
                alg: jwk.alg,
                kty: jwk.kty,
                pub: jwk.pub
            };
            break;
        case 'EC':
            check(jwk.crv, '"crv" (Curve) Parameter');
            check(jwk.x, '"x" (X Coordinate) Parameter');
            check(jwk.y, '"y" (Y Coordinate) Parameter');
            components = {
                crv: jwk.crv,
                kty: jwk.kty,
                x: jwk.x,
                y: jwk.y
            };
            break;
        case 'OKP':
            check(jwk.crv, '"crv" (Subtype of Key Pair) Parameter');
            check(jwk.x, '"x" (Public Key) Parameter');
            components = {
                crv: jwk.crv,
                kty: jwk.kty,
                x: jwk.x
            };
            break;
        case 'RSA':
            check(jwk.e, '"e" (Exponent) Parameter');
            check(jwk.n, '"n" (Modulus) Parameter');
            components = {
                e: jwk.e,
                kty: jwk.kty,
                n: jwk.n
            };
            break;
        case 'oct':
            check(jwk.k, '"k" (Key Value) Parameter');
            components = {
                k: jwk.k,
                kty: jwk.kty
            };
            break;
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]('"kty" (Key Type) Parameter missing or unsupported');
    }
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(JSON.stringify(components));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["digest"])(digestAlgorithm, data));
}
async function calculateJwkThumbprintUri(key, digestAlgorithm) {
    digestAlgorithm ??= 'sha256';
    const thumbprint = await calculateJwkThumbprint(key, digestAlgorithm);
    return `urn:ietf:params:oauth:jwk-thumbprint:sha-${digestAlgorithm.slice(-3)}:${thumbprint}`;
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwe_decrypt.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkRecipient",
    ()=>checkRecipient,
    "checkShared",
    ()=>checkShared,
    "decryptCompact",
    ()=>decryptCompact,
    "decryptJWE",
    ()=>decryptJWE,
    "decryptRecipient",
    ()=>decryptRecipient,
    "decryptResult",
    ()=>decryptResult,
    "prepareDecrypt",
    ()=>prepareDecrypt,
    "shareJWE",
    ()=>shareJWE
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/content_encryption.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/helpers.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key_management$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/key_management.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$options$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/options.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/key.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwe_algorithms.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$deflate$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/deflate.js [middleware-edge] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
function checkShared(jwe) {
    if (jwe.iv !== undefined && typeof jwe.iv !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Initialization Vector incorrect type');
    }
    if (typeof jwe.ciphertext !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Ciphertext missing or incorrect type');
    }
    if (jwe.tag !== undefined && typeof jwe.tag !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Authentication Tag incorrect type');
    }
    if (jwe.protected !== undefined && typeof jwe.protected !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Protected Header incorrect type');
    }
    if (jwe.aad !== undefined && typeof jwe.aad !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE AAD incorrect type');
    }
    if (jwe.unprotected !== undefined && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isObject"])(jwe.unprotected)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Shared Unprotected Header incorrect type');
    }
}
function checkRecipient(jwe) {
    if (jwe.encrypted_key !== undefined && typeof jwe.encrypted_key !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Encrypted Key incorrect type');
    }
    if (jwe.header !== undefined && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isObject"])(jwe.header)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Per-Recipient Unprotected Header incorrect type');
    }
    if (jwe.protected === undefined && jwe.header === undefined && jwe.unprotected === undefined) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JOSE Header missing');
    }
}
function shareJWE(jwe) {
    let parsedProt;
    if (jwe.protected) {
        parsedProt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["parseJoseHeader"])(jwe.protected, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"], 'JWE Protected Header is invalid');
    }
    const protectedHeader = jwe.protected !== undefined ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])(jwe.protected) : new Uint8Array();
    return {
        parsedProt,
        ciphertext: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64url"])(jwe.ciphertext, 'ciphertext', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]),
        iv: jwe.iv !== undefined ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64url"])(jwe.iv, 'iv', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]) : undefined,
        tag: jwe.tag !== undefined ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64url"])(jwe.tag, 'tag', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]) : undefined,
        additionalData: jwe.aad !== undefined ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["concat"])(protectedHeader, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encode"])('.'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["encodeBase64url"])(jwe.aad, 'aad', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"])) : protectedHeader
    };
}
function decryptResult(jwe, decrypted) {
    const result = {
        plaintext: decrypted.plaintext
    };
    if (jwe.protected !== undefined) {
        result.protectedHeader = decrypted.parsedProt;
    }
    if (jwe.aad !== undefined) {
        result.additionalAuthenticatedData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64url"])(jwe.aad, 'aad', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]);
    }
    if (jwe.unprotected !== undefined) {
        result.sharedUnprotectedHeader = jwe.unprotected;
    }
    if (jwe.header !== undefined) {
        result.unprotectedHeader = jwe.header;
    }
    if (decrypted.resolvedKey) {
        return {
            ...result,
            key: decrypted.key
        };
    }
    return result;
}
function prepareDecrypt(options) {
    return {
        keyManagementAlgorithms: options && (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$options$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["validateAlgorithms"])('keyManagementAlgorithms', options.keyManagementAlgorithms),
        contentEncryptionAlgorithms: options && (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$options$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["validateAlgorithms"])('contentEncryptionAlgorithms', options.contentEncryptionAlgorithms),
        options
    };
}
async function decryptRecipient(jwe, token, shared, key) {
    const { options } = shared;
    const { parsedProt } = token;
    let joseHeader;
    if (jwe.header !== undefined || jwe.unprotected !== undefined) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isDisjoint"])(parsedProt, jwe.header, jwe.unprotected)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint');
        }
        joseHeader = {
            ...parsedProt,
            ...jwe.header,
            ...jwe.unprotected
        };
    } else {
        joseHeader = parsedProt ?? {};
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$options$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["validateCrit"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"], __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$options$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWE_RECOGNIZED"], options?.crit, parsedProt, joseHeader);
    if (joseHeader.zip !== undefined && joseHeader.zip !== 'DEF') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value.');
    }
    if (joseHeader.zip !== undefined && !parsedProt?.zip) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE "zip" (Compression Algorithm) Header Parameter MUST be in a protected header.');
    }
    const { alg, enc } = joseHeader;
    if (typeof alg !== 'string' || !alg) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('missing JWE Algorithm (alg) in JWE Header');
    }
    if (typeof enc !== 'string' || !enc) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('missing JWE Encryption Algorithm (enc) in JWE Header');
    }
    const { keyManagementAlgorithms, contentEncryptionAlgorithms } = shared;
    if (keyManagementAlgorithms && !keyManagementAlgorithms.has(alg) || !keyManagementAlgorithms && alg.startsWith('PBES2')) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSEAlgNotAllowed"]('"alg" (Algorithm) Header Parameter value not allowed');
    }
    if (contentEncryptionAlgorithms && !contentEncryptionAlgorithms.has(enc)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSEAlgNotAllowed"]('"enc" (Encryption Algorithm) Header Parameter value not allowed');
    }
    const encEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweEncryption"])(enc);
    let encryptedKey;
    if (jwe.encrypted_key !== undefined) {
        encryptedKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$helpers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decodeBase64url"])(jwe.encrypted_key, 'encrypted_key', __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]);
    }
    let resolvedKey = false;
    if (typeof key === 'function') {
        key = await key(parsedProt, jwe);
        resolvedKey = true;
    }
    const algEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_algorithms$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jweAlgorithm"])(alg);
    const k = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["prepareKey"])(alg === 'dir' ? encEntry : algEntry, key, 'decrypt');
    let cek;
    try {
        cek = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$key_management$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decryptKeyManagement"])(alg, encEntry, k, encryptedKey, joseHeader, options);
    } catch (err) {
        if (err instanceof TypeError || err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"] || err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]) {
            throw err;
        }
        cek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["generateCek"])(encEntry);
    }
    let plaintext = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$content_encryption$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decrypt"])(encEntry, cek, token.ciphertext, token.iv, token.tag, token.additionalData);
    if (joseHeader.zip === 'DEF') {
        const maxDecompressedLength = options?.maxDecompressedLength ?? 250_000;
        if (maxDecompressedLength === 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JOSENotSupported"]('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
        }
        if (maxDecompressedLength !== Infinity && (!Number.isSafeInteger(maxDecompressedLength) || maxDecompressedLength < 1)) {
            throw new TypeError('maxDecompressedLength must be 0, a positive safe integer, or Infinity');
        }
        plaintext = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$deflate$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decompress"])(plaintext, maxDecompressedLength).catch((cause)=>{
            if (cause instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]) throw cause;
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('Failed to decompress plaintext', {
                cause
            });
        });
    }
    return {
        plaintext,
        parsedProt,
        key: k,
        resolvedKey
    };
}
async function decryptJWE(jwe, shared, key) {
    return decryptRecipient(jwe, shareJWE(jwe), shared, key);
}
async function decryptCompact(jwe, shared, key) {
    if (jwe instanceof Uint8Array) {
        jwe = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decoder"].decode(jwe);
    }
    if (typeof jwe !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('Compact JWE must be a string or Uint8Array');
    }
    const { 0: protectedHeader, 1: encryptedKey, 2: iv, 3: ciphertext, 4: tag, length } = jwe.split('.');
    if (length !== 5) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWEInvalid"]('Invalid Compact JWE');
    }
    return decryptJWE({
        ciphertext,
        iv: iv || undefined,
        protected: protectedHeader,
        tag: tag || undefined,
        encrypted_key: encryptedKey || undefined
    }, shared, key);
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/jwt/decrypt.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jwtDecrypt",
    ()=>jwtDecrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_decrypt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwe_decrypt.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwt_claims_set$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/jwt_claims_set.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
;
;
;
async function jwtDecrypt(jwt, key, options) {
    const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_decrypt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decryptCompact"])(jwt, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwe_decrypt$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["prepareDecrypt"])(options), key);
    const protectedHeader = decrypted.parsedProt;
    const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$jwt_claims_set$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["validateClaimsSet"])(protectedHeader, decrypted.plaintext, options);
    if (protectedHeader.iss !== undefined && protectedHeader.iss !== payload.iss) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('replicated "iss" claim header parameter mismatch', payload, 'iss', 'mismatch');
    }
    if (protectedHeader.sub !== undefined && protectedHeader.sub !== payload.sub) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('replicated "sub" claim header parameter mismatch', payload, 'sub', 'mismatch');
    }
    if (protectedHeader.aud !== undefined && JSON.stringify(protectedHeader.aud) !== JSON.stringify(payload.aud)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('replicated "aud" claim header parameter mismatch', payload, 'aud', 'mismatch');
    }
    const result = {
        payload,
        protectedHeader
    };
    if (typeof key === 'function') {
        return {
            ...result,
            key: decrypted.key
        };
    }
    return result;
}
}),
"[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/decode_jwt.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeJwt",
    ()=>decodeJwt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/base64url.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/buffer_utils.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/lib/type_checks.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/masterguitar/node_modules/jose/dist/webapi/util/errors.js [middleware-edge] (ecmascript)");
;
;
;
;
function decodeJwt(jwt) {
    if (typeof jwt !== 'string') throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTInvalid"]('JWTs must use Compact JWS serialization, JWT must be a string');
    const { 1: payload, length } = jwt.split('.');
    if (length === 5) throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTInvalid"]('Only JWTs using Compact JWS serialization can be decoded');
    if (length !== 3) throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTInvalid"]('Invalid JWT');
    if (!payload) throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTInvalid"]('JWTs must contain a payload');
    let decoded;
    try {
        decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$base64url$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["decode"])(payload);
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTInvalid"]('Failed to base64url decode the payload');
    }
    let result;
    try {
        result = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$buffer_utils$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["strictDecoder"].decode(decoded));
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTInvalid"]('Failed to parse the decoded payload as JSON');
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$lib$2f$type_checks$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isObject"])(result)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$masterguitar$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$util$2f$errors$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["JWTInvalid"]('Invalid JWT Claims Set');
    return result;
}
}),
]);

//# sourceMappingURL=15rx_jose_dist_webapi_1f9hzp7._.js.map