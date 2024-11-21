export enum Options {
    Mainnet = 'Mainnet',
    Testnet = 'Testnet',
  }
  
export type OptionsLower = Lowercase<Options>

export function toOptionsLower(o: Options): OptionsLower {
    return o.toLowerCase() as OptionsLower
}