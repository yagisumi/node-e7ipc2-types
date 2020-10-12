export { Result, OK, ERR } from './result'
import { Serializable, Result } from './result'

const Tag = 'type$' as const
type Tag = typeof Tag

type OptsType = Record<string, Serializable | undefined>

type CommandsSpec = {
  [key: string]: { opts: OptsType; ret: Serializable }
}

export type CommandOptions<T extends CommandsSpec, K extends keyof T> = T[K]['opts'] & { [Tag]: K }

export type CommandReturn<T extends CommandsSpec, K extends keyof T> = Promise<Result<T[K]['ret']>>

type CheckOpts<ComKeys extends string, Opts, Ret> = Tag extends keyof Opts
  ? never
  : { [P in ComKeys]: { opts: Opts; ret: Ret } }

type CheckCommandType<ComKeys extends string, Com> = Com extends {
  opts?: Record<string, Serializable | undefined>
  ret: Serializable
}
  ? Com['opts'] extends Record<string, Serializable | undefined>
    ? CheckOpts<ComKeys, Com['opts'], Com['ret']>
    : // eslint-disable-next-line @typescript-eslint/ban-types
      { [P in ComKeys]: { opts: {}; ret: Com['ret'] } }
  : never

type CommandMapUnion<T, ComKeys extends keyof T = keyof T> = ComKeys extends keyof T & string
  ? CheckCommandType<ComKeys, T[ComKeys]>
  : never

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never

export type CommandMap<T> = UnionToIntersection<CommandMapUnion<T>>

export interface Client<T extends CommandsSpec> {
  invoke: <K extends keyof T>(req: T[K]['opts'] & { [Tag]: K }) => Promise<Result<T[K]['ret']>>
}

export type Handler<T extends CommandsSpec, Event = unknown, K extends keyof T = keyof T> = (
  event: Event,
  cmd: T[K]['opts'] & { [Tag]: K }
) => Promise<Result<T[K]['ret']>>

export interface Server<T extends CommandsSpec> {
  handle(listener: Handler<T>): void
  handleOnce(listener: Handler<T>): void
  removeHandler(): void
}
