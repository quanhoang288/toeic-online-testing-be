import * as fsPromises from 'fs/promises';

export function deleteFileAsync(filePath: string): Promise<void> {
  return fsPromises.unlink(filePath);
}
