# sc-codec-pbf
Minimal binary codec for SC based on [pbf](https://www.npmjs.com/package/pbf).  
This codec helps reduce bandwidth usage and is ideal for games and other high-throughput applications.

This module is designed to be hooked up on both the client and server.

This codec also assumes you're using one proto message type per SocketCluster client/worker instance for maximum efficiency, and that you're either sending objects that can be encoded with that message, or strings.

To install, use:

```bash
npm install --save sc-codec-pbf
```

Install pbf and compile a JavaScript module from a .proto file:

```
# example.proto
message Example {
  int64 x = 1;
  int64 y = 2;
  string playerID = 3;
  PlayerState playerState = 4;
  enum PlayerState {
    MOVING = 0;
    TALKING = 1;
    IN_COMBAT = 2;
  }
}
```

```bash
$ npm install -g pbf
$ pbf example.proto > example.js
```

On the server, inside `worker.js`, you should use:

```js
var scCodecPbf = require('sc-codec-pbf');

// ...pbf
// This needs to go inside the run function - Near the top.
var Example = require('./example.js').Example;
worker.scServer.setCodecEngine(new scCodecPbf(Example));
```

On the client-side, you can either include the `sc-codec-pbf` module using
your favorite bundler such as Browserify or Webpack or you can include the `sc-codec-pbf.js`
file using a script tag; this will expose the `scCodecPbf` object globally.
To use it, you just need to add it on connect:


```js
var socket = socketCluster.connect({
  // ...
  codecEngine: new scCodecPbf(Example)
});

socket.emit('playerUpdate', {
  x: 500,
  y: 204,
  playerID: 'sdshu8ijodln',
  playerState: 0
})
```

Note that the codec used on the client and on the server always need to match.

## Early Benchmarks

This hasn't been extensively battle tested yet, but early comparisons show a reduction of around half from `sc-codec-min-bin`. With the example above, Chrome WS frame inspector showed:

- **JSON Stringify/Parse**: 87 bytes
- **sc-codec-min-bin**: 54 bytes
- **sc-codec-pbf**: 27 bytes

---

## Contributing

To build the global script for the browser:

```bash
browserify -s scCodecPbf index.js > sc-codec-pbf.js
```
