import { CommandMap, Client, OK, ERR, Result } from '@/e7ipc2-types'
import { assertType, expectType } from './assertType'

type ThenArg<T> = T extends PromiseLike<infer U>
  ? U
  : T extends (...args: any[]) => PromiseLike<infer V>
  ? V
  : T

describe('e7ipc2-types', () => {
  test('CommandMap', async () => {
    type Commands = CommandMap<{
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

    assertType.equal<keyof Commands, 'com1' | 'com2' | 'com3'>()
    assertType.notEqual<keyof Commands, 'com1' | 'com2' | 'com3'>(false)

    const client: Client<Commands> = { invoke: () => {} } as any

    const r1 = client.invoke({ type$: 'com1', a: 0, b: 'B' })
    const r2 = client.invoke({ type$: 'com2' })
    const r3a = client.invoke({ type$: 'com3', a: 0 })
    const r3b = client.invoke({ type$: 'com3', a: 0, b: 'B' })

    type R1 = typeof r1
    type R2 = typeof r2
    type R3a = typeof r3a
    type R4b = typeof r3b

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
  })
})
