import {
  DefineCommands,
  Client,
  OK,
  ERR,
  Result,
  CommandOptions,
  CommandReturn,
  Server,
  defineHandler,
} from '@/e7ipc2-types'
import { assertType, expectType } from './assertType'

type ThenArg<T> = T extends PromiseLike<infer U>
  ? U
  : T extends (...args: any[]) => PromiseLike<infer V>
  ? V
  : T

type Commands = DefineCommands<{
  com1: {
    opts: {
      a: number
      b: string
    }
    ret: number
  }
  com2: {
    ret: {
      x: number
    }
  }
  com3: {
    opts: {
      a: number
      b?: string
    }
    ret: string
  }
  com4: {
    x: Record<string, unknown>
    y: number
  }
}>

describe('e7ipc2-types', () => {
  test('DefineCommands', () => {
    assertType.equal<keyof Commands, 'com1' | 'com2' | 'com3'>()
    assertType.notEqual<keyof Commands, 'com1' | 'com2' | 'com3'>(false)
  })

  test('client.invoke(), options and return types', async () => {
    const client: Client<Commands> = { invoke: () => {} } as any

    const opts1 = { $cmd: 'com1', a: 0, b: 'B' } as const
    const opts2 = { $cmd: 'com2' } as const
    const opts3a = { $cmd: 'com3', a: 0 } as const
    const opts3b = { $cmd: 'com3', a: 0, b: 'B' } as const

    const r1 = client.invoke(opts1)
    const r2 = client.invoke(opts2)
    const r3a = client.invoke(opts3a)
    const r3b = client.invoke(opts3b)

    type OptsCom1 = CommandOptions<Commands, 'com1'>
    type OptsCom2 = CommandOptions<Commands, 'com2'>
    type OptsCom3 = CommandOptions<Commands, 'com3'>

    assertType.assignable<typeof opts1, OptsCom1>()
    assertType.notAssignable<typeof opts1, OptsCom1>(false)
    assertType.assignable<typeof opts2, OptsCom1>(false)
    assertType.notAssignable<typeof opts2, OptsCom1>()

    assertType.assignable<typeof opts2, OptsCom2>()
    assertType.notAssignable<typeof opts2, OptsCom2>(false)
    assertType.assignable<typeof opts3a, OptsCom2>(false)
    assertType.notAssignable<typeof opts3a, OptsCom2>()

    assertType.assignable<typeof opts3a, OptsCom3>()
    assertType.notAssignable<typeof opts3a, OptsCom3>(false)
    assertType.assignable<typeof opts1, OptsCom3>(false)
    assertType.notAssignable<typeof opts1, OptsCom3>()

    assertType.assignable<typeof opts3b, OptsCom3>()
    assertType.notAssignable<typeof opts3b, OptsCom3>(false)
    assertType.assignable<typeof opts2, OptsCom3>(false)
    assertType.notAssignable<typeof opts2, OptsCom3>()

    type R1 = typeof r1
    type R2 = typeof r2
    type R3a = typeof r3a
    type R3b = typeof r3b

    type CR1 = CommandReturn<Commands, 'com1'>
    type CR2 = CommandReturn<Commands, 'com2'>
    type CR3 = CommandReturn<Commands, 'com3'>

    assertType.equal<R1, CR1>()
    assertType.notEqual<R1, CR1>(false)

    assertType.equal<R2, CR2>()
    assertType.notEqual<R2, CR2>(false)

    assertType.equal<R3a, CR3>()
    assertType.notEqual<R3a, CR3>(false)

    assertType.equal<R3b, CR3>()
    assertType.notEqual<R3b, CR3>(false)

    const err = ERR('test')
    const ok_num = OK(3)
    const ok_str = OK('str')
    const ok_obj1 = OK({ x: 100 })
    const ok_obj2 = OK({ x: 'string' })

    expectType<ThenArg<R1>>(err)
    expectType<ThenArg<R1>>(ok_num)

    assertType.equal<R1, Promise<Result<number>>>()
    assertType.notEqual<R1, Promise<Result<number>>>(false)
    assertType.equal<R1, Promise<Result<string>>>(false)
    assertType.notEqual<R1, Promise<Result<string>>>()

    assertType.assignable<typeof ok_num, ThenArg<R1>>()
    assertType.notAssignable<typeof ok_num, ThenArg<R1>>(false)

    assertType.assignable<typeof err, ThenArg<R1>>()
    assertType.notAssignable<typeof err, ThenArg<R1>>(false)

    assertType.assignable<typeof ok_str, ThenArg<R1>>(false)
    assertType.notAssignable<typeof ok_str, ThenArg<R1>>()

    expectType<ThenArg<R2>>(err)
    expectType<ThenArg<R2>>(ok_obj1)

    assertType.equal<R2, Promise<Result<{ x: number }>>>()
    assertType.notEqual<R2, Promise<Result<{ x: number }>>>(false)

    assertType.equal<R2, Promise<Result<{ x: string }>>>(false)
    assertType.notEqual<R2, Promise<Result<{ x: string }>>>()

    assertType.assignable<typeof ok_obj1, ThenArg<R2>>()
    assertType.notAssignable<typeof ok_obj1, ThenArg<R2>>(false)

    assertType.assignable<typeof ok_obj2, ThenArg<R2>>(false)
    assertType.notAssignable<typeof ok_obj2, ThenArg<R2>>()

    assertType.assignable<typeof ok_num, ThenArg<R2>>(false)
    assertType.notAssignable<typeof ok_num, ThenArg<R2>>()

    assertType.assignable<typeof err, ThenArg<R2>>()
    assertType.notAssignable<typeof err, ThenArg<R2>>(false)

    expectType<ThenArg<R3a>>(err)
    expectType<ThenArg<R3a>>(ok_str)
    expectType<ThenArg<R3b>>(err)
    expectType<ThenArg<R3b>>(ok_str)

    assertType.equal<R3a, R3b>()
    assertType.notEqual<R3a, R3b>(false)

    assertType.equal<R3a, Promise<Result<string>>>()
    assertType.notEqual<R3a, Promise<Result<string>>>(false)
    assertType.equal<R3a, Promise<Result<number>>>(false)
    assertType.notEqual<R3a, Promise<Result<number>>>()

    assertType.assignable<typeof ok_str, ThenArg<R3a>>()
    assertType.notAssignable<typeof ok_str, ThenArg<R3a>>(false)

    assertType.assignable<typeof err, ThenArg<R3a>>()
    assertType.notAssignable<typeof err, ThenArg<R3a>>(false)

    assertType.assignable<typeof ok_obj1, ThenArg<R3a>>(false)
    assertType.notAssignable<typeof ok_obj1, ThenArg<R3a>>()
  })

  test('handlers and server', async () => {
    const handlers_ok = defineHandler<Commands>({
      com1: async (_, opts) => {
        opts.a
        opts.b
        return OK(2)
      },
      com2: async (_, _opts) => {
        return OK({ x: 100 })
      },
      com3: async (_, opts) => {
        opts.a
        opts.b
        return OK('str')
      },
    })

    const r1ok = await handlers_ok({}, { $cmd: 'com1', a: 0, b: '' })
    expect(r1ok.ok).toBe(true)
    expect(r1ok.value).toBe(2)

    const r2ok = await handlers_ok({}, { $cmd: 'com2' })
    expect(r2ok.ok).toBe(true)
    expect(r2ok.value).toEqual({ x: 100 })

    const r3ok = await handlers_ok({}, { $cmd: 'com3', a: 0 })
    expect(r3ok.ok).toBe(true)
    expect(r3ok.value).toBe('str')

    const r4ok = await handlers_ok({}, { $cmd: 'com4' } as any)
    expect(r4ok.ok).toBe(false)
    expect(r4ok.error).not.toBeUndefined()
    if (r4ok.error) {
      expect(r4ok.error.message).toBe('unexpected $cmd: com4')
    }
    expect(r4ok.error)

    const handlers_err = defineHandler<Commands>({
      com1: async (_, _opts) => {
        return ERR('test')
      },
      com2: async (_, _opts) => {
        return ERR(new Error())
      },
      com3: async (_, _opts) => {
        return ERR(100)
      },
    })

    const server: Server<Commands> = {
      handle: () => {},
      handleOnce: () => {},
      removeHandler: () => {},
    } as any

    server.handle(handlers_ok)
    server.handle(handlers_err)
    server.handleOnce(handlers_ok)
    server.handleOnce(handlers_err)
    server.removeHandler()
    server.removeHandler()
  })
})
