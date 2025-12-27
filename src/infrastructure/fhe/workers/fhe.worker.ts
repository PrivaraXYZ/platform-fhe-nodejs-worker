import { FheConfig, DEFAULT_FHE_CONFIG } from '@domain/fhe/model/fhe-config';

interface ZamaEncryptedInput {
  add64: (value: number | bigint) => ZamaEncryptedInput;
  addAddress: (value: string) => ZamaEncryptedInput;
  addBool: (value: boolean) => ZamaEncryptedInput;
  encrypt: () => Promise<{ handles: Uint8Array[]; inputProof: Uint8Array }>;
}

interface ZamaFhevmInstance {
  createEncryptedInput: (contractAddress: string, userAddress: string) => ZamaEncryptedInput;
}

interface ZamaSDK {
  createInstance: (config: unknown) => Promise<ZamaFhevmInstance>;
  SepoliaConfig: unknown;
}

export interface EncryptTask {
  type: 'uint64' | 'address' | 'bool';
  value: string | boolean;
  contractAddress: string;
  userAddress: string;
}

export interface EncryptResult {
  handle: string;
  proof: string;
  encryptionTimeMs: number;
}

let fhevmInstance: ZamaFhevmInstance | null = null;
let sdkModule: ZamaSDK | null = null;
let initPromise: Promise<void> | null = null;
// TODO: Use config when custom network support is added
const _config: FheConfig = DEFAULT_FHE_CONFIG;

async function ensureInitialized(): Promise<void> {
  if (fhevmInstance) return;

  if (initPromise) return initPromise;

  initPromise = doInitialize();
  await initPromise;
}

async function doInitialize(): Promise<void> {
  try {
    sdkModule = (await import('@zama-fhe/relayer-sdk/node')) as unknown as ZamaSDK;
    fhevmInstance = await sdkModule.createInstance(sdkModule.SepoliaConfig);
  } catch (error) {
    initPromise = null;
    throw error;
  }
}

function toHexString(bytes: Uint8Array): string {
  return (
    '0x' +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
}

export default async function encrypt(task: EncryptTask): Promise<EncryptResult> {
  await ensureInitialized();

  const startTime = Date.now();
  const input = fhevmInstance!.createEncryptedInput(task.contractAddress, task.userAddress);

  switch (task.type) {
    case 'uint64':
      input.add64(BigInt(task.value as string));
      break;
    case 'address':
      input.addAddress(task.value as string);
      break;
    case 'bool':
      input.addBool(task.value as boolean);
      break;
  }

  const encrypted = await input.encrypt();

  return {
    handle: toHexString(encrypted.handles[0]),
    proof: toHexString(encrypted.inputProof),
    encryptionTimeMs: Date.now() - startTime,
  };
}
