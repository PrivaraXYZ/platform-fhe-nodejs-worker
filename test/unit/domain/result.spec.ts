import { Ok, Err, isOk, isErr, unwrap, unwrapOr, Result } from '@domain/common/result';

describe('Result utilities', () => {
  describe('Ok', () => {
    it('should create a success result', () => {
      const result: Result<string, Error> = Ok('value');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('value');
      }
    });
  });

  describe('Err', () => {
    it('should create an error result', () => {
      const error = new Error('test error');
      const result: Result<string, Error> = Err(error);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(error);
      }
    });
  });

  describe('isOk', () => {
    it('should return true for Ok result', () => {
      const result = Ok('value');

      expect(isOk(result)).toBe(true);
    });

    it('should return false for Err result', () => {
      const result = Err(new Error('test'));

      expect(isOk(result)).toBe(false);
    });
  });

  describe('isErr', () => {
    it('should return true for Err result', () => {
      const result = Err(new Error('test'));

      expect(isErr(result)).toBe(true);
    });

    it('should return false for Ok result', () => {
      const result = Ok('value');

      expect(isErr(result)).toBe(false);
    });
  });

  describe('unwrap', () => {
    it('should return value for Ok result', () => {
      const result = Ok('value');

      expect(unwrap(result)).toBe('value');
    });

    it('should throw error for Err result', () => {
      const error = new Error('test error');
      const result = Err(error);

      expect(() => unwrap(result)).toThrow(error);
    });
  });

  describe('unwrapOr', () => {
    it('should return value for Ok result', () => {
      const result = Ok('value');

      expect(unwrapOr(result, 'default')).toBe('value');
    });

    it('should return default for Err result', () => {
      const result = Err(new Error('test'));

      expect(unwrapOr(result, 'default')).toBe('default');
    });
  });
});
