import { ERR, OK } from '@/result'

describe('Result', () => {
  test('OK', () => {
    expect(OK(1)).toEqual({ ok: true, value: 1, error: undefined })
    expect(OK({ a: 'test ' })).toEqual({ ok: true, value: { a: 'test ' }, error: undefined })
  })

  test('ERR', () => {
    const err1 = ERR('string')
    expect(err1.ok).toBe(false)
    expect(err1.value).toBeUndefined()
    expect(err1.error).toBeInstanceOf(Error)
    expect(err1.error.name).toBe('Error')
    expect(err1.error.message).toBe('string')

    const err2 = ERR(1)
    expect(err2.ok).toBe(false)
    expect(err2.value).toBeUndefined()
    expect(err2.error).toBeInstanceOf(Error)
    expect(err2.error.name).toBe('Error')
    expect(err2.error.message).toBe('unexpected error')

    const err3 = ERR(new Error())
    expect(err3.ok).toBe(false)
    expect(err3.value).toBeUndefined()
    expect(err3.error).toBeInstanceOf(Error)
    expect(err3.error.name).toBe('Error')
    expect(err3.error.message).toBe('')

    const err4 = ERR({ name: 'err', message: 'msg', foo: 100 })
    expect(err4.ok).toBe(false)
    expect(err4.value).toBeUndefined()
    expect(err4.error).toBeInstanceOf(Error)
    expect(err4.error.name).toBe('err')
    expect(err4.error.message).toBe('msg')
  })
})
