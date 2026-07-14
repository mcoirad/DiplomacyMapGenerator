/*
  Minimal browser ZIP writer used by the webDip export.
  It implements the JSZip methods this sketch uses:
  new JSZip().file(path, content).generateAsync({ type: "blob" }).
*/
(function (global) {
  "use strict";

  var encoder = new TextEncoder();
  var crcTable = null;

  function makeCrcTable() {
    var table = new Uint32Array(256);
    for (var i = 0; i < 256; i++) {
      var c = i;
      for (var j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c >>> 0;
    }
    return table;
  }

  function crc32(bytes) {
    if (!crcTable) crcTable = makeCrcTable();
    var crc = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) {
      crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function writeUint16(view, offset, value) {
    view.setUint16(offset, value, true);
    return offset + 2;
  }

  function writeUint32(view, offset, value) {
    view.setUint32(offset, value >>> 0, true);
    return offset + 4;
  }

  function concat(parts) {
    var length = 0;
    for (var i = 0; i < parts.length; i++) length += parts[i].length;

    var output = new Uint8Array(length);
    var offset = 0;
    for (var j = 0; j < parts.length; j++) {
      output.set(parts[j], offset);
      offset += parts[j].length;
    }
    return output;
  }

  function toBytes(content) {
    if (content instanceof Uint8Array) {
      return Promise.resolve(content);
    }

    if (content instanceof ArrayBuffer) {
      return Promise.resolve(new Uint8Array(content));
    }

    if (content instanceof Blob) {
      return content.arrayBuffer().then(function (buffer) {
        return new Uint8Array(buffer);
      });
    }

    return Promise.resolve(encoder.encode(String(content)));
  }

  function createLocalHeader(entry) {
    var header = new Uint8Array(30);
    var view = new DataView(header.buffer);
    var offset = 0;
    offset = writeUint32(view, offset, 0x04034b50);
    offset = writeUint16(view, offset, 20);
    offset = writeUint16(view, offset, 0);
    offset = writeUint16(view, offset, 0);
    offset = writeUint16(view, offset, 0);
    offset = writeUint16(view, offset, 33);
    offset = writeUint32(view, offset, entry.crc);
    offset = writeUint32(view, offset, entry.bytes.length);
    offset = writeUint32(view, offset, entry.bytes.length);
    offset = writeUint16(view, offset, entry.nameBytes.length);
    writeUint16(view, offset, 0);
    return header;
  }

  function createCentralHeader(entry) {
    var header = new Uint8Array(46);
    var view = new DataView(header.buffer);
    var offset = 0;
    offset = writeUint32(view, offset, 0x02014b50);
    offset = writeUint16(view, offset, 20);
    offset = writeUint16(view, offset, 20);
    offset = writeUint16(view, offset, 0);
    offset = writeUint16(view, offset, 0);
    offset = writeUint16(view, offset, 0);
    offset = writeUint16(view, offset, 33);
    offset = writeUint32(view, offset, entry.crc);
    offset = writeUint32(view, offset, entry.bytes.length);
    offset = writeUint32(view, offset, entry.bytes.length);
    offset = writeUint16(view, offset, entry.nameBytes.length);
    offset = writeUint16(view, offset, 0);
    offset = writeUint16(view, offset, 0);
    offset = writeUint16(view, offset, 0);
    offset = writeUint16(view, offset, 0);
    offset = writeUint32(view, offset, 0);
    writeUint32(view, offset, entry.localOffset);
    return header;
  }

  function createEndRecord(fileCount, centralSize, centralOffset) {
    var record = new Uint8Array(22);
    var view = new DataView(record.buffer);
    var offset = 0;
    offset = writeUint32(view, offset, 0x06054b50);
    offset = writeUint16(view, offset, 0);
    offset = writeUint16(view, offset, 0);
    offset = writeUint16(view, offset, fileCount);
    offset = writeUint16(view, offset, fileCount);
    offset = writeUint32(view, offset, centralSize);
    offset = writeUint32(view, offset, centralOffset);
    writeUint16(view, offset, 0);
    return record;
  }

  function SimpleZip() {
    this.entries = [];
  }

  SimpleZip.prototype.file = function (name, content) {
    this.entries.push({ name: name, content: content });
    return this;
  };

  SimpleZip.prototype.generateAsync = function (options) {
    options = options || {};

    return Promise.all(
      this.entries.map(function (entry) {
        return toBytes(entry.content).then(function (bytes) {
          return {
            name: entry.name,
            nameBytes: encoder.encode(entry.name),
            bytes: bytes,
            crc: crc32(bytes),
            localOffset: 0,
          };
        });
      })
    ).then(function (entries) {
      var fileParts = [];
      var centralParts = [];
      var offset = 0;

      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        entry.localOffset = offset;

        var localHeader = createLocalHeader(entry);
        fileParts.push(localHeader, entry.nameBytes, entry.bytes);
        offset += localHeader.length + entry.nameBytes.length + entry.bytes.length;
      }

      var centralOffset = offset;
      for (var j = 0; j < entries.length; j++) {
        var centralHeader = createCentralHeader(entries[j]);
        centralParts.push(centralHeader, entries[j].nameBytes);
        offset += centralHeader.length + entries[j].nameBytes.length;
      }

      var centralSize = offset - centralOffset;
      var endRecord = createEndRecord(entries.length, centralSize, centralOffset);
      var zipBytes = concat(fileParts.concat(centralParts, [endRecord]));

      if (options.type === "uint8array") return zipBytes;
      return new Blob([zipBytes], { type: "application/zip" });
    });
  };

  global.JSZip = SimpleZip;
})(window);
