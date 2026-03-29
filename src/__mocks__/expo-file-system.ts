export const cacheDirectory = '/cache/';
export const documentDirectory = '/documents/';
export enum EncodingType {
	UTF8 = 'utf8',
	Base64 = 'base64',
}
export const writeAsStringAsync = jest.fn().mockResolvedValue(undefined);
export const readAsStringAsync = jest.fn().mockResolvedValue('base64string==');
export const deleteAsync = jest.fn().mockResolvedValue(undefined);
export const getInfoAsync = jest.fn().mockResolvedValue({ exists: true, isDirectory: false, size: 1024 });
export const copyAsync = jest.fn().mockResolvedValue(undefined);
export const moveAsync = jest.fn().mockResolvedValue(undefined);
export const makeDirectoryAsync = jest.fn().mockResolvedValue(undefined);
export const downloadAsync = jest.fn().mockResolvedValue({ uri: '/cache/file.pdf', status: 200 });
