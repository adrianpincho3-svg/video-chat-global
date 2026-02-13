import { getRedisClient } from '../config/redis';

/**
 * Guarda un hash en Redis
 */
export async function setHash(key: string, data: Record<string, any>, ttl?: number): Promise<void> {
  const client = getRedisClient();
  
  // Convertir valores a strings, manejando correctamente todos los tipos
  const stringData: Record<string, string> = {};
  for (const [field, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      stringData[field] = '';
    } else if (typeof value === 'object') {
      stringData[field] = JSON.stringify(value);
    } else {
      stringData[field] = String(value);
    }
  }
  
  await client.hSet(key, stringData);
  
  if (ttl) {
    await client.expire(key, ttl);
  }
}

/**
 * Obtiene un hash de Redis
 */
export async function getHash(key: string): Promise<Record<string, string> | null> {
  const client = getRedisClient();
  const data = await client.hGetAll(key);
  
  if (Object.keys(data).length === 0) {
    return null;
  }
  
  return data;
}

/**
 * Obtiene un hash de Redis y lo parsea a un objeto tipado
 */
export async function getHashParsed<T>(key: string): Promise<T | null> {
  const data = await getHash(key);
  
  if (!data) {
    return null;
  }
  
  // Intentar parsear valores JSON
  const parsed: any = {};
  for (const [field, value] of Object.entries(data)) {
    try {
      parsed[field] = JSON.parse(value);
    } catch {
      parsed[field] = value;
    }
  }
  
  return parsed as T;
}

/**
 * Elimina una clave de Redis
 */
export async function deleteKey(key: string): Promise<boolean> {
  const client = getRedisClient();
  const result = await client.del(key);
  return result > 0;
}

/**
 * Agrega un elemento a una lista
 */
export async function pushToList(key: string, value: string): Promise<void> {
  const client = getRedisClient();
  await client.rPush(key, value);
}

/**
 * Remueve un elemento de una lista
 */
export async function removeFromList(key: string, value: string): Promise<void> {
  const client = getRedisClient();
  await client.lRem(key, 0, value);
}

/**
 * Obtiene todos los elementos de una lista
 */
export async function getList(key: string): Promise<string[]> {
  const client = getRedisClient();
  return await client.lRange(key, 0, -1);
}

/**
 * Obtiene la longitud de una lista
 */
export async function getListLength(key: string): Promise<number> {
  const client = getRedisClient();
  return await client.lLen(key);
}

/**
 * Guarda un string en Redis
 */
export async function setString(key: string, value: string, ttl?: number): Promise<void> {
  const client = getRedisClient();
  
  if (ttl) {
    await client.setEx(key, ttl, value);
  } else {
    await client.set(key, value);
  }
}

/**
 * Obtiene un string de Redis
 */
export async function getString(key: string): Promise<string | null> {
  const client = getRedisClient();
  return await client.get(key);
}

/**
 * Agrega un elemento a un set
 */
export async function addToSet(key: string, value: string): Promise<void> {
  const client = getRedisClient();
  await client.sAdd(key, value);
}

/**
 * Remueve un elemento de un set
 */
export async function removeFromSet(key: string, value: string): Promise<void> {
  const client = getRedisClient();
  await client.sRem(key, value);
}

/**
 * Verifica si un elemento está en un set
 */
export async function isInSet(key: string, value: string): Promise<boolean> {
  const client = getRedisClient();
  return await client.sIsMember(key, value);
}

/**
 * Obtiene todos los elementos de un set
 */
export async function getSet(key: string): Promise<string[]> {
  const client = getRedisClient();
  return await client.sMembers(key);
}

/**
 * Incrementa un contador
 */
export async function incrementCounter(key: string, amount: number = 1): Promise<number> {
  const client = getRedisClient();
  return await client.incrBy(key, amount);
}

/**
 * Decrementa un contador
 */
export async function decrementCounter(key: string, amount: number = 1): Promise<number> {
  const client = getRedisClient();
  return await client.decrBy(key, amount);
}

/**
 * Obtiene el valor de un contador
 */
export async function getCounter(key: string): Promise<number> {
  const client = getRedisClient();
  const value = await client.get(key);
  return value ? parseInt(value, 10) : 0;
}

/**
 * Agrega un elemento a un sorted set
 */
export async function addToSortedSet(key: string, score: number, member: string): Promise<void> {
  const client = getRedisClient();
  await client.zAdd(key, { score, value: member });
}

/**
 * Obtiene elementos de un sorted set por rango de score
 */
export async function getSortedSetByScore(
  key: string,
  min: number,
  max: number
): Promise<string[]> {
  const client = getRedisClient();
  return await client.zRangeByScore(key, min, max);
}

/**
 * Verifica si una clave existe
 */
export async function keyExists(key: string): Promise<boolean> {
  const client = getRedisClient();
  const result = await client.exists(key);
  return result > 0;
}

/**
 * Establece un TTL en una clave existente
 */
export async function setExpire(key: string, seconds: number): Promise<boolean> {
  const client = getRedisClient();
  return await client.expire(key, seconds);
}

/**
 * Obtiene el TTL de una clave
 */
export async function getTTL(key: string): Promise<number> {
  const client = getRedisClient();
  return await client.ttl(key);
}
