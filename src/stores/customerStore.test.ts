import { useCustomerStore } from './customerStore';
import { customerService } from '../services/customerService';

// Mock the customerService
jest.mock('../services/customerService', () => ({
  customerService: {
    createCustomer: jest.fn(),
    fetchCustomers: jest.fn(),
  }
}));

describe('customerStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCustomerStore.setState({ customers: [], loading: false, error: null, totalCount: 0 });
  });

  it('createCustomer handles errors correctly', async () => {
    const error = new Error("Could not find the table 'public.customers' in the schema cache");
    (customerService.createCustomer as jest.Mock).mockRejectedValue(error);

    await expect(useCustomerStore.getState().createCustomer({ name: 'Test' }))
      .rejects.toThrow(error);

    const state = useCustomerStore.getState();
    expect(state.error).toBe(error.message);
    expect(state.loading).toBe(false);
  });

  it('createCustomer successfully updates state after success', async () => {
    const mockCustomer = { id: '123', name: 'Test' };
    (customerService.createCustomer as jest.Mock).mockResolvedValue(mockCustomer);

    const result = await useCustomerStore.getState().createCustomer({ name: 'Test' });
    
    expect(result).toEqual(mockCustomer);
    const state = useCustomerStore.getState();
    expect(state.customers[0]).toEqual(mockCustomer);
    expect(state.totalCount).toBe(1);
    expect(state.loading).toBe(false);
  });
});
