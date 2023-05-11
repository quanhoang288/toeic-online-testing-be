export interface IFile {
  fieldname: string;
  encoding: string;
  buffer: Buffer;
  filename: string;
  path: string;
  mimetype: string;
  originalname: string;
  size: number;
}
