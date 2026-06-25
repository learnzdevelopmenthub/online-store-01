import { Router } from 'express';

import {
  getBook,
  getFeaturedBooks,
  getNewReleases,
  listBooks,
  searchBooks,
} from '../controllers/books.controller.js';

export const booksRouter = Router();

booksRouter.get('/', listBooks);
booksRouter.get('/search', searchBooks);
booksRouter.get('/featured', getFeaturedBooks);
booksRouter.get('/new-releases', getNewReleases);
booksRouter.get('/:id', getBook);
