function formatAsValueBlock(value) {
  const buffer = Buffer.alloc(16);
  buffer.writeIntLE(value, 0, 4);
  [0, 1, 2, 3].forEach(i =>
    console.log(buffer[i].toString(16), (~buffer[i] & 0xff).toString(16))
  );
  [0, 1, 2, 3].forEach(i =>
    buffer.write((~buffer[i] & 0xff).toString(16), 4 + i, 'hex')
  );
  buffer.writeIntLE(value, 8, 4);
  buffer.write('FF00FF00', 12, 'hex');
  return buffer.toString('hex');
}

console.log(formatAsValueBlock(1920000));
