export enum DynamicEclipseNetworkIds {
  Mainnet = 200,
  Testnet = 201,
}

export function isDynamicEclipseNetworkId(
  value: number,
): value is DynamicEclipseNetworkIds {
  return value in DynamicEclipseNetworkIds;
}
