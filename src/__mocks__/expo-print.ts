export const printToFileAsync = jest.fn().mockResolvedValue({ uri: '/tmp/invoice.pdf' });
export const print = jest.fn().mockResolvedValue(undefined);
