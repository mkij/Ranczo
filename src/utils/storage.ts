import { File, Paths } from 'expo-file-system/next';

function getPath(key: string): File {
  return new File(Paths.document, key + '.json');
}

export async function getItem(key: string): Promise<string | null> {
  try {
    const file = getPath(key);
    if (file.exists) {
      return file.text();
    }
    return null;
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    const file = getPath(key);
    file.write(value);
  } catch {
    // Ignore write errors
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    const file = getPath(key);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Ignore delete errors
  }
}