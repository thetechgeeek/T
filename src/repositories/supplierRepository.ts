import { createRepository } from './baseRepository';
import type { Supplier } from '../types/supplier';

export const supplierRepository = createRepository<Supplier>('suppliers');
