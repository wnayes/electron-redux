function isObjectLike(value: unknown) {
    return !!value && typeof value == 'object'
}

function isString(value: unknown) {
    return (
        typeof value == 'string' ||
        (!Array.isArray(value) &&
            isObjectLike(value) &&
            Object.prototype.toString.call(value) == '[object String]')
    )
}

function isHostObject(value: unknown) {
    // Many host objects are `Object` objects that can coerce to strings
    // despite having improperly defined `toString` methods.

    let result = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (value != null && typeof (value as any).toString != 'function') {
        try {
            result = !!(value + '')
            // eslint-disable-next-line no-empty
        } catch (e) {}
    }

    return result
}

function overArg<T, R>(func: (arg: R) => R, transform: (arg: T) => R): (arg: T) => R {
    return function (arg: T) {
        return func(transform(arg))
    }
}

const getPrototype = overArg(Object.getPrototypeOf, Object)

function isPlainObject(value: unknown) {
    if (
        !isObjectLike(value) ||
        Object.prototype.toString.call(value) != '[object Object]' ||
        isHostObject(value)
    ) {
        return false
    }

    const proto = getPrototype(value)

    if (proto === null) {
        return true
    }

    const Ctor = Object.prototype.hasOwnProperty.call(proto, 'constructor') && proto.constructor

    return (
        typeof Ctor == 'function' &&
        Ctor instanceof Ctor &&
        Function.prototype.toString.call(Ctor) == Function.prototype.toString.call(Object)
    )
}

export const isFSA = (action: FluxStandardAction): boolean =>
    isPlainObject(action) && isString(action.type) && Object.keys(action).every(isValidKey)

const isValidKey = (key: string) => ['type', 'payload', 'error', 'meta'].indexOf(key) > -1

export type FluxStandardAction<Meta = unknown> = {
    type: string
    payload?: unknown
    meta?: Meta
}
