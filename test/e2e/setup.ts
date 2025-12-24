jest.mock('piscina', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      run: jest.fn().mockResolvedValue({
        handle: '0xhandle',
        proof: '0xproof',
        encryptionTimeMs: 1000,
      }),
      destroy: jest.fn().mockResolvedValue(undefined),
    })),
  };
});
