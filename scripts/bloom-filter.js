// Two simple hash functions
function djb2(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // Ensure positive integer
}

function sdbm(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
  }
  return hash >>> 0; // Ensure positive integer
}

export class BloomFilter {
  /**
   * Create a new Bloom Filter.
   * Can be initialized in two ways:
   * 1. For building: new BloomFilter({ itemsCount, falsePositiveRate })
   * 2. For loading: new BloomFilter({ buffer, hashCount })
   */
  constructor(options) {
    if (options.itemsCount && options.falsePositiveRate) {
      // 1. Initializing for building a new filter
      const { itemsCount, falsePositiveRate } = options;
      // Optimal size of the bit array
      this.size = -Math.floor((itemsCount * Math.log(falsePositiveRate)) / (Math.LN2 * Math.LN2));
      // Optimal number of hash functions
      this.hashCount = Math.max(1, Math.round((this.size / itemsCount) * Math.LN2));
      // The bit array, stored in a Uint8Array for space efficiency
      this.buffer = new Uint8Array(Math.ceil(this.size / 8));
    } else if (options.buffer && options.hashCount && options.size) {
      // 2. Initializing from an existing buffer
      this.buffer = new Uint8Array(options.buffer);
      this.size = options.size; // Use the exact size from metadata
      this.hashCount = options.hashCount;
    } else {
      throw new Error('Invalid BloomFilter constructor options');
    }
  }

  /**
   * Generates `this.hashCount` hashes for a given string.
   * Uses the double-hashing trick to generate multiple hashes from two.
   * @param {string} item The item to hash
   * @returns {number[]} An array of hash values
   */
  getHashes(item) {
    const hashes = [];
    const hash1 = djb2(item);
    const hash2 = sdbm(item);
    for (let i = 0; i < this.hashCount; i++) {
      hashes.push((hash1 + i * hash2) % this.size);
    }
    return hashes;
  }

  /**
   * Add an item to the filter.
   * (Only used during the build process)
   * @param {string} item The item to add
   */
  add(item) {
    const hashes = this.getHashes(item);
    for (const hash of hashes) {
      const byteIndex = Math.floor(hash / 8);
      const bitIndex = hash % 8;
      this.buffer[byteIndex] |= (1 << bitIndex);
    }
  }

  /**
   * Test if an item is in the filter.
   * @param {string} item The item to test
   * @returns {boolean} True if the item is likely in the set, false if it is definitely not.
   */
  test(item) {
    const hashes = this.getHashes(item);
    for (const hash of hashes) {
      const byteIndex = Math.floor(hash / 8);
      const bitIndex = hash % 8;
      if ((this.buffer[byteIndex] & (1 << bitIndex)) === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns the underlying ArrayBuffer for serialization.
   * (Only used during the build process)
   * @returns {ArrayBuffer}
   */
  getSerializedBuffer() {
      // Return a copy
      return this.buffer.buffer.slice(0);
  }
}
