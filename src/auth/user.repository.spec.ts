import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

const mockCredentialsDto: AuthCredentialsDto = {
  username: 'test',
  password: 'test12345',
};

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('successfully signs up the user', async () => {
      save.mockResolvedValue(undefined);
      const user = await userRepository.signUp(mockCredentialsDto);
      expect(user).toEqual(undefined);
    });

    // it('throws a conflict as username already exists', async () => {
    //   const mockedValue = { code: '23505' };
    //   save.mockRejectedValue(mockedValue);
    //   expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
    //     ConflictException,
    //   );
    // });
    //
    // it('throws a conflict as username already exists', () => {
    //   const mockedValue = { code: '11111' };
    //   save.mockRejectedValue(mockedValue);
    //   expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
    //     InternalServerErrorException,
    //   );
    // });
  });

  describe('signIn', () => {
    let user;

    beforeEach(() => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = 'Test';
      user.validatePassword = jest.fn();
    });

    it('returns username if validation is successful', () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);
      expect(userRepository.signIn(mockCredentialsDto)).resolves.toEqual(
        'Test',
      );
    });

    it('returns null if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userRepository.signIn(mockCredentialsDto);
      expect(user.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null if password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);
      const result = await userRepository.signIn(mockCredentialsDto);
      expect(user.validatePassword).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('testHash');
      const result = await userRepository.hashPassword(
        'testPassword',
        'testSalt',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt');
      expect(result).toEqual('testHash');
    });
  });
});
