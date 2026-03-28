import { createRepository } from './baseRepository';
import type { Expense } from '../types/finance';

export const expenseRepository = createRepository<Expense>('expenses');
