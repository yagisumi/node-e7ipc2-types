import { ERR, OK, ensureSerializable } from '@/result'

describe('Result', () => {
  test('OK', () => {
    expect(OK(1)).toEqual({ ok: true, value: 1, error: undefined })
    expect(OK({ a: 'test ' })).toEqual({ ok: true, value: { a: 'test ' }, error: undefined })
  })

  test('ERR', () => {
    expect(ERR('string')).toEqual({
      ok: false,
      value: undefined,
      error: { $type: 'Message', name: 'Error', message: 'string' },
    })

    expect(ERR(1)).toEqual({
      ok: false,
      value: undefined,
      error: { $type: 'Unknown', name: 'Error', message: 'unexpected error', value: 1 },
    })

    const err = new Error()
    expect(ERR(err)).toEqual({
      ok: false,
      value: undefined,
      error: { $type: 'Error', name: 'Error', message: '', stack: err.stack },
    })

    expect(ERR({ name: 'err', message: 'msg', foo: 100 })).toEqual({
      ok: false,
      value: undefined,
      error: { $type: 'ErrorLike', name: 'err', message: 'msg', foo: 100 },
    })
  })

  test('serialize', () => {
    const circularReference: any = { otherData: 123 }
    circularReference.myself = circularReference

    expect(() => {
      JSON.stringify(circularReference)
    }).toThrowError()

    expect(() => {
      ensureSerializable(circularReference)
    }).not.toThrowError()

    const v = ensureSerializable(circularReference)
    expect(v).toEqual({ otherData: 123 })
  })
})
