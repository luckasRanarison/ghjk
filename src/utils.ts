import { Err, Ok, Result } from "./deps.ts";

export async function runAndReturn(
  cmd: string[],
  cwd?: string,
  env: Record<string, string> = Deno.env.toObject(),
): Promise<Result<string, string>> {
  const output = await new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd,
    stdout: "piped",
    stderr: "piped",
    env,
  }).output();

  return output.success
    ? Ok(new TextDecoder().decode(output.stdout))
    : Err(new TextDecoder().decode(output.stderr));
}

export async function runOrExit(
  cmd: string[],
  cwd?: string,
  env: Record<string, string> = Deno.env.toObject(),
) {
  const p = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd,
    stdout: "piped",
    stderr: "piped",
    env,
  }).spawn();

  // keep pipe asynchronous till the command exists
  void p.stdout.pipeTo(Deno.stdout.writable, { preventClose: true });
  void p.stderr.pipeTo(Deno.stderr.writable, { preventClose: true });

  const { code, success } = await p.status;
  if (!success) {
    Deno.exit(code);
  }
}

export function dirs() {
  const home = Deno.env.get("HOME");
  if (!home) {
    throw new Error("cannot find home dir");
  }
  return { homeDir: home, shareDir: `${home}/.local/share/ghjk` };
}
