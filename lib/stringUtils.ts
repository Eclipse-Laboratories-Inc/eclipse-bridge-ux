export function truncateWalletAddress(str: string) {
  if (str.length <= 8) {
    return str;
  }

  const firstPart = str.slice(0, 4);
  const lastPart = str.slice(-4);

  return `${firstPart}•••${lastPart}`;
}

export function toKebabCase(str: string) {
  return str.toLowerCase().replace(" ", "-");
}

