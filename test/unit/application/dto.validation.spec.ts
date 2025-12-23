import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  EncryptRequestDto,
  EncryptUint64RequestDto,
  EncryptAddressRequestDto,
  EncryptBoolRequestDto,
  EncryptionTypeDto,
} from '@application/dto';

describe('DTO Validation', () => {
  const validContractAddress = '0x1234567890123456789012345678901234567890';
  const validUserAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

  describe('EncryptRequestDto', () => {
    it('should pass validation for valid uint64 request', async () => {
      const dto = plainToInstance(EncryptRequestDto, {
        type: EncryptionTypeDto.UINT64,
        value: '1000000',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation for valid address request', async () => {
      const dto = plainToInstance(EncryptRequestDto, {
        type: EncryptionTypeDto.ADDRESS,
        value: validUserAddress,
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation for valid bool request', async () => {
      const dto = plainToInstance(EncryptRequestDto, {
        type: EncryptionTypeDto.BOOL,
        value: true,
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for invalid type', async () => {
      const dto = plainToInstance(EncryptRequestDto, {
        type: 'invalid',
        value: '1000',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('type');
    });

    it('should fail validation for invalid contract address', async () => {
      const dto = plainToInstance(EncryptRequestDto, {
        type: EncryptionTypeDto.UINT64,
        value: '1000',
        contractAddress: 'invalid',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'contractAddress')).toBe(true);
    });

    it('should fail validation for invalid user address', async () => {
      const dto = plainToInstance(EncryptRequestDto, {
        type: EncryptionTypeDto.UINT64,
        value: '1000',
        contractAddress: validContractAddress,
        userAddress: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'userAddress')).toBe(true);
    });
  });

  describe('EncryptUint64RequestDto', () => {
    it('should pass validation for valid request', async () => {
      const dto = plainToInstance(EncryptUint64RequestDto, {
        value: '1000000',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for non-numeric value', async () => {
      const dto = plainToInstance(EncryptUint64RequestDto, {
        value: 'abc',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('value');
    });

    it('should fail validation for empty value', async () => {
      const dto = plainToInstance(EncryptUint64RequestDto, {
        value: '',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('EncryptAddressRequestDto', () => {
    it('should pass validation for valid request', async () => {
      const dto = plainToInstance(EncryptAddressRequestDto, {
        value: validUserAddress,
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for invalid value address', async () => {
      const dto = plainToInstance(EncryptAddressRequestDto, {
        value: 'invalid',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('value');
    });
  });

  describe('EncryptBoolRequestDto', () => {
    it('should pass validation for true value', async () => {
      const dto = plainToInstance(EncryptBoolRequestDto, {
        value: true,
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation for false value', async () => {
      const dto = plainToInstance(EncryptBoolRequestDto, {
        value: false,
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for non-boolean value', async () => {
      const dto = plainToInstance(EncryptBoolRequestDto, {
        value: 'true',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
