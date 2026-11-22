export type Side = 'A' | 'B'
export type ServiceStart = { serving: Side; server: 0 | 1; receiver: 0 | 1 }
export function doublesService(start: ServiceStart, rallies: Side[]) {
  const other = (s: Side): Side => s === 'A' ? 'B' : 'A'
  const positions: Record<Side, [number, number]> = { A: [0,1], B: [0,1] }
  positions[start.serving] = [start.server,1-start.server]
  positions[other(start.serving)] = [start.receiver,1-start.receiver]
  const score = { A:0, B:0 }
  let serving = start.serving
  for (const side of rallies) {
    if (side === serving) positions[side] = [positions[side][1],positions[side][0]]
    score[side]++; serving = side
  }
  const court = score[serving] % 2
  return { serving, receiving:other(serving), server:positions[serving][court], receiver:positions[other(serving)][court], court:court ? 'left' : 'right', score }
}
