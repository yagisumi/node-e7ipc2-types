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

type CommandsSpec = Record<string, CommandData>

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

type GetHandler<Cmds extends CommandsSpec, CmdName extends keyof Cmds, Event = unknown> = (
  ev: Event,
  opts: CommandOptions<Cmds, CmdName>
) => CommandReturn<Cmds, CmdName>
type HandlerMap<
  Cmds extends CommandsSpec,
  Event = unknown,
  CmdName extends keyof Cmds = keyof Cmds
> = {
  [P in CmdName]: GetHandler<Cmds, P, Event>
}

export type Handler<Cmds extends CommandsSpec, Event = unknown> = (
  ev: Event,
  opts: CommandOptionsUnion<Cmds>
) => CommandReturn<Cmds>

export function defineHandler<Cmds extends CommandsSpec, Event = unknown>(
  handlerMap: HandlerMap<Cmds, Event>
): Handler<Cmds, Event> {
  return async function (ev: Event, opts: CommandOptions<Cmds>) {
    const handler = handlerMap[opts.$cmd]
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
  handle(listener: Handler<Cmds>): void
  handleOnce(listener: Handler<Cmds>): void
  removeHandler(): void
}
