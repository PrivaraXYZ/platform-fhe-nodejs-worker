import { registerAs } from '@nestjs/config';
import { FheConfig } from '@domain/fhe/model/fhe-config';

export default registerAs(
  'fhe',
  (): FheConfig => ({
    network: {
      chainId: parseInt(process.env.FHE_CHAIN_ID || '11155111', 10),
      networkName: process.env.FHE_NETWORK_NAME || 'Ethereum Sepolia',
      networkUrl: process.env.FHE_NETWORK_URL || 'https://eth-sepolia.public.blastapi.io',
      gatewayUrl: process.env.FHE_GATEWAY_URL || 'https://relayer.testnet.zama.org',
      aclAddress: process.env.FHE_ACL_ADDRESS || '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
      kmsAddress: process.env.FHE_KMS_ADDRESS || '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
    },
  }),
);
