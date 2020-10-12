export type Serializable = null | string | number | boolean | SerializableObject | SerializableArray
interface SerializableObject extends Record<string, Serializable> {}
interface SerializableArray extends Array<Serializable> {}

function ensureSerializable(obj: unknown) {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (e) {
    return {}
  }
}

type ErrorLike = {
  name: string
  message: string
  stack?: string
  value?: Serializable
}

function isErrorLike(obj: any): obj is ErrorLike {
  return (
    typeof obj === 'object' &&
    obj != null &&
    'name' in obj &&
    'message' in obj &&
    typeof obj.name === 'string' &&
    typeof obj.message === 'string'
  )
}

export function wrapError(err: unknown): ErrorLike {
  if (typeof err === 'string') {
    return {
      name: 'Error',
      message: err,
    }
  } else if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    }
  } else if (isErrorLike(err)) {
    return err
  } else {
    return {
      name: 'Error',
      message: 'unexpected error',
      value: ensureSerializable(err),
    }
  }
}

export type OK<T> = {
  ok: true
  error: undefined
  value: T
}

export type ERR = {
  ok: false
  error: ErrorLike
  value: undefined
}

export function OK<T>(value: T): OK<T> {
  return {
    ok: true,
    error: undefined,
    value,
  }
}

export function ERR(error: unknown): ERR {
  return {
    ok: false,
    error: wrapError(error),
    value: undefined,
  }
}

export type Result<T> = OK<T> | ERR
