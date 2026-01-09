// scripts/build-whitelist.js
import { promises as fs } from 'fs';
import { BloomFilter } from './bloom-filter.js';

const CSV_PATH = './dist/top-1m.csv';
const OUTPUT_PATH = './dist/whitelist.bin';
const METADATA_PATH = './dist/whitelist.meta.json';

const ITEMS_COUNT = 1_000_000;
const FALSE_POSITIVE_RATE = 0.0001;

async function build() {
  console.log('Starting whitelist build process...');

  const filter = new BloomFilter({
    itemsCount: ITEMS_COUNT,
    falsePositiveRate: FALSE_POSITIVE_RATE,
  });

  const csvContent = await fs.readFile(CSV_PATH, 'utf-8');
  const lines = csvContent.split('\n');

  if (!csvContent.trim()) {
    throw new Error("top-1m.csv is empty");
  }

  let addedCount = 0;
  for (const line of lines) {
    const [, domain] = line.split(',');
    if (domain) {
      filter.add(domain.trim().toLowerCase());
      addedCount++;
    }
  }

  const buffer = filter.getSerializedBuffer();
  await fs.writeFile(OUTPUT_PATH, Buffer.from(buffer));

  await fs.writeFile(
    METADATA_PATH,
    JSON.stringify(
      {
        size: filter.size,
        hashCount: filter.hashCount,
        itemsCount: addedCount,
        falsePositiveRate: FALSE_POSITIVE_RATE,
        sizeInBytes: buffer.byteLength,
      },
      null,
      2
    )
  );

  console.log('Whitelist build complete');
  console.log(filter.test("google.com"));   // true
  console.log(filter.test("youtube.com"));  // true
  console.log(filter.test("this-domain-should-not-exist.example")); // false
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
