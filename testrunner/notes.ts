// notes.ts — AUSZUG
let baseEpochUs: bigint;
let hrStartNs: bigint;

export function startNotesClock() {
  baseEpochUs = BigInt(Date.now()) * 1000n;     // ms → µs
  hrStartNs = process.hrtime.bigint();          // hochauflösender Start
}

export function note(msg: string) {
  const deltaUs = (process.hrtime.bigint() - hrStartNs) / 1000n; // ns → µs
  const tsUs = baseEpochUs + deltaUs;
  // exakt eine Zeile, keine zusätzlichen Logs:
  process.stdout.write(`${tsUs} ${msg}\n`);
}
