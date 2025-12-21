export interface FheNetworkConfig {
  chainId: number;
  networkName: string;
  networkUrl: string;
  gatewayUrl: string;
  aclAddress: string;
  kmsAddress: string;
}

export interface FheConfig {
  network: FheNetworkConfig;
}

export const DEFAULT_FHE_CONFIG: FheConfig = {
  network: {
    chainId: 11155111,
    networkName: 'Ethereum Sepolia',
    networkUrl: 'https://eth-sepolia.public.blastapi.io',
    gatewayUrl: 'https://relayer.testnet.zama.org',
    aclAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
    kmsAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
  },
};
