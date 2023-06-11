import * as fsPromises from 'fs/promises';

export async function deleteFileAsync(filePath: string): Promise<void> {
  try {
    await fsPromises.unlink(filePath);
  } catch (error) {
    console.warn(error);
  }
}
