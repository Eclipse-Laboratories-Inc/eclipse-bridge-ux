export function assertNever(x: never): never {
    throw new Error(`assertNever: expected value to be never, got ${x} ${typeof x}`)
}