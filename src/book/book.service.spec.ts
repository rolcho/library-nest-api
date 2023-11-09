import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { getModelToken } from '@nestjs/mongoose';
import { Book, Category } from './schemas/book.schema';
import mongoose, { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '../auth/schemas/user.schema';
import { CreateBookDto } from './dto/create-book.dto';

describe('BookService', () => {
  let bookService: BookService;
  let model: Model<Book>;

  const mockBook = {
    _id: '654bb7b8ab915398b4cb35e6',
    title: 'Fantastic User',
    description: 'Guard User',
    author: 'My User',
    price: 20,
    category: Category.ADVENTURE,
    user: '654b6757cb2dad9ea8d151f6',
  };

  const mockUser = {
    _id: '654b6757cb2dad9ea8d151f6',
    name: 'Myname',
    email: 'myemail@gmail.com',
  };

  const mockBookService = {
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getModelToken(Book.name),
          useValue: mockBookService,
        },
      ],
    }).compile();

    bookService = module.get<BookService>(BookService);
    model = module.get<Model<Book>>(getModelToken(Book.name));
  });

  describe('findById', () => {
    it('should find and return a book by ID', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockBook);

      const result = await bookService.findById(mockBook._id);

      expect(model.findById).toHaveBeenLastCalledWith(mockBook._id);
      expect(result).toEqual(mockBook);
    });

    it('should throw BadRequestException if ID is not valid', async () => {
      const id = 'invalid-id';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(bookService.findById(id)).rejects.toThrow(
        BadRequestException,
      );

      expect(isValidObjectIdMock).toHaveBeenCalledWith(id);
      isValidObjectIdMock.mockRestore();
    });

    it('should throw NotFoundException if book is not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      await expect(bookService.findById(mockBook._id)).rejects.toThrow(
        NotFoundException,
      );

      expect(model.findById).toHaveBeenLastCalledWith(mockBook._id);
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const query = {
        bookPerPage: '1',
        currentPage: '1',
      };

      jest.spyOn(model, 'find').mockImplementation(
        () =>
          ({
            sort: () => ({
              limit: () => ({
                skip: () => ({
                  lean: jest.fn().mockResolvedValue([mockBook]),
                }),
              }),
            }),
          }) as any,
      );

      const result = await bookService.findAll(query);

      expect(result).toEqual([mockBook]);
    });

    it('should return empty array of books', async () => {
      const query = { bookPerPage: '1', currentPage: '1', keyword: 'Qwerty' };

      jest.spyOn(model, 'find').mockImplementation(
        () =>
          ({
            sort: () => ({
              limit: () => ({
                skip: () => ({
                  lean: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }) as any,
      );

      const result = await bookService.findAll(query);

      expect(model.find).toHaveBeenCalledWith({
        title: {
          $regex: 'Qwerty',
          $options: 'i',
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('deleteById', () => {
    it('should throw BadRequestException if book ID is not valid', async () => {
      const id = 'invalid-id';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(bookService.deleteById(id)).rejects.toThrow(
        new BadRequestException('Please enter a valid id'),
      );

      expect(isValidObjectIdMock).toHaveBeenLastCalledWith(id);
      isValidObjectIdMock.mockRestore();
    });

    it('should delete and return a book by ID', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockBook);

      const result = await bookService.deleteById(mockBook._id);

      expect(model.findByIdAndDelete).toHaveBeenLastCalledWith(mockBook._id, {
        new: true,
        runValidators: true,
      });
      expect(result).toEqual(mockBook);
    });
  });

  describe('updateById', () => {
    const titleUpdate = { title: 'Fantastic Updated' };
    const mockUpdatedBook = {
      ...mockBook,
      ...titleUpdate,
    };

    it('should throw BadRequestException if ID is not valid', async () => {
      const id = 'invalid-id';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(bookService.updateById(id, null)).rejects.toThrow(
        BadRequestException,
      );

      expect(isValidObjectIdMock).toHaveBeenCalledWith(id);
      isValidObjectIdMock.mockRestore();
    });

    it('should update and return a book by ID', async () => {
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(mockUpdatedBook);

      const result = await bookService.updateById(
        mockBook._id,
        titleUpdate as any,
      );

      expect(model.findByIdAndUpdate).toHaveBeenLastCalledWith(
        mockBook._id,
        titleUpdate as any,
        {
          new: true,
          runValidators: true,
        },
      );
      expect(result.title).toEqual(mockUpdatedBook.title);
    });
  });

  describe('create', () => {
    it('should create and return a book', async () => {
      const newBook = {
        title: 'Fantastic User',
        description: 'Guard User',
        author: 'My User',
        price: 20,
        category: Category.ADVENTURE,
      };
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockBook) as any);

      const result = await bookService.create(
        newBook as CreateBookDto,
        mockUser as User,
      );

      expect(result).toEqual(mockBook);
    });
  });
});
