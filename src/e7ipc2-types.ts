export { Result, OK, ERR } from './result'
import { Result, ERR } from './result'

type OptsData = Record<string, unknown>

type CommandData = {
  opts: OptsData
  ret: unknown
}

type LooseCmdData = {
  opts?: OptsData
  ret: unknown
}

export type CommandsSpec = Record<string, CommandData>

type ComplementOpts<CmdKey extends string, CmdData> = CmdData extends LooseCmdData
  ? CmdData['opts'] extends OptsData
    ? { [P in CmdKey]: CmdData }
    : // eslint-disable-next-line @typescript-eslint/ban-types
      { [P in CmdKey]: { opts: {}; ret: CmdData['ret'] } }
  : never

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never

type ComplementCmds<Cmds, CmdName extends keyof Cmds = keyof Cmds> = CmdName extends keyof Cmds &
  string
  ? ComplementOpts<CmdName, Cmds[CmdName]>
  : never

export type DefineCommands<Cmds> = UnionToIntersection<ComplementCmds<Cmds>>

export type CommandOptions<
  Cmds extends CommandsSpec,
  CmdName extends keyof Cmds = keyof Cmds
> = Cmds[CmdName]['opts'] & { $cmd: CmdName }

type CommandOptionsUnion<Cmds extends CommandsSpec> = {
  [P in keyof Cmds]: CommandOptions<Cmds, P>
}[keyof Cmds]

export type CommandReturn<Cmds extends CommandsSpec, CmdName extends keyof Cmds = keyof Cmds> = {
  [P in CmdName]: Promise<Result<Cmds[CmdName]['ret']>>
}[CmdName]

export type CmdHandler<Cmds extends CommandsSpec, CmdName extends keyof Cmds, Event = unknown> = (
  ev: Event,
  opts: CommandOptions<Cmds, CmdName>
) => CommandReturn<Cmds, CmdName>

export type Handlers<
  Cmds extends CommandsSpec,
  Event = any,
  CmdName extends keyof Cmds = keyof Cmds
> = {
  [P in CmdName]: CmdHandler<Cmds, P, Event>
}

export type Listener<Cmds extends CommandsSpec, Event = any> = (
  ev: Event,
  opts: CommandOptionsUnion<Cmds>
) => CommandReturn<Cmds>

/**
 * ```ts
 * defineHandler<Cmds>(handlerMap: HandlerMap<Cmds>): Handler<Cmds>
 * ```
 * @param handlers
 */
export function defineHandlers<Cmds extends CommandsSpec, Event = any>(
  handlers: Handlers<Cmds, Event>
): Listener<Cmds, Event> {
  return async function (ev: Event, opts: CommandOptions<Cmds>) {
    const handler = handlers[opts.$cmd]
    if (handler != null) {
      const r = await handler(ev, opts).catch(ERR)
      return r
    } else {
      return ERR(`unexpected $cmd: ${opts.$cmd}`)
    }
  }
}

export interface Client<Cmds extends CommandsSpec> {
  invoke<CmdName extends keyof Cmds = keyof Cmds>(
    opts: Cmds[CmdName]['opts'] & { $cmd: CmdName }
  ): Promise<Result<Cmds[CmdName]['ret']>>
}

export interface Server<Cmds extends CommandsSpec> {
  handle(listener: Listener<Cmds>): void
  handleOnce(listener: Listener<Cmds>): void
  removeHandler(): void
}
