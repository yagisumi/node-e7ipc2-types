import { ERR, OK } from '@/result'

describe('Result', () => {
  test('OK', () => {
    expect(OK(1)).toEqual({ ok: true, value: 1, error: undefined })
    expect(OK({ a: 'test ' })).toEqual({ ok: true, value: { a: 'test ' }, error: undefined })
  })

  test('ERR', () => {
    expect(ERR('string')).toEqual({
      ok: false,
      value: undefined,
      error: { name: 'Error', message: 'string' },
    })

    expect(ERR(1)).toEqual({
      ok: false,
      value: undefined,
      error: { name: 'Error', message: 'unexpected error', value: 1 },
    })

    const err = new Error()
    expect(ERR(err)).toEqual({
      ok: false,
      value: undefined,
      error: { name: 'Error', message: '', stack: err.stack },
    })

    expect(ERR({ name: 'err', message: 'msg', foo: 100 })).toEqual({
      ok: false,
      value: undefined,
      error: { name: 'err', message: 'msg', foo: 100 },
    })
  })
})
