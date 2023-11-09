import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { Category } from './schemas/book.schema';
import { PassportModule } from '@nestjs/passport';
import { CreateBookDto } from './dto/create-book.dto';
import { User } from '../auth/schemas/user.schema';
import { UpdateBookDto } from './dto/update-book.dto';

describe('BookSController', () => {
  let bookService: BookService;
  let bookController: BookController;

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
    findAll: jest.fn().mockResolvedValueOnce([mockBook]),
    findById: jest.fn().mockResolvedValueOnce(mockBook),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    bookService = module.get<BookService>(BookService);
    bookController = module.get<BookController>(BookController);
  });

  it('should be defined', () => {
    expect(bookController).toBeDefined();
  });

  describe('getAllBooks', () => {
    it('should get all books', async () => {
      const result = await bookController.getAllBooks({});

      expect(bookService.findAll).toHaveBeenCalled();
      expect(result).toStrictEqual([mockBook]);
    });
  });

  describe('getBook', () => {
    it('should get a book by ID', async () => {
      const result = await bookController.getBook(mockBook._id);

      expect(bookService.findById).toHaveBeenCalled();
      expect(result).toStrictEqual(mockBook);
    });
  });

  describe('createBook', () => {
    it('should create a new book', async () => {
      const newBook = {
        title: 'Fantastic User',
        description: 'Guard User',
        author: 'My User',
        price: 20,
        category: Category.ADVENTURE,
      };

      mockBookService.create = jest.fn().mockResolvedValueOnce(mockBook);

      const result = await bookController.createBook(
        newBook as CreateBookDto,
        mockUser as User,
      );

      expect(bookService.create).toHaveBeenCalled();
      expect(result).toStrictEqual(mockBook);
    });
  });

  describe('updateBook', () => {
    it('should update a book', async () => {
      const titleUpdate = { title: 'Fantastic Updated' };
      const mockUpdatedBook = {
        ...mockBook,
        ...titleUpdate,
      };

      mockBookService.updateById = jest
        .fn()
        .mockResolvedValueOnce(mockUpdatedBook);

      const result = await bookController.updateBook(
        mockBook._id,
        titleUpdate as UpdateBookDto,
      );

      expect(bookService.updateById).toHaveBeenCalled();
      expect(result).toStrictEqual(mockUpdatedBook);
    });
  });

  describe('deleteBook', () => {
    it('should delete a book', async () => {
      mockBookService.deleteById = jest
        .fn()
        .mockResolvedValueOnce({ delete: true });

      const result = await bookController.deleteBook(mockBook._id);

      expect(bookService.deleteById).toHaveBeenCalled();
      expect(result).toStrictEqual({ delete: true });
    });
  });
});
