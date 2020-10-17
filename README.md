# Quest Bee JS
> A resiliant swarm of managers for [Quest Dolphin JS](https://github.com/QuestNetwork/quest-dolphin-js) and [Quest Coral JS](https://github.com/QuestNetwork/quest-coral-js)

## Lead Maintainer

[StationedInTheField](https://github.com/StationedInTheField)


## Description

The Bee process for the [Quest Network Operating System](https://github.com/QuestNetwork/quest-os-js) interacts with optional user facing technology, [Quest Coral JS](https://github.com/QuestNetwork/quest-coral-js) and [Quest Dolphin JS](https://github.com/QuestNetwork/quest-dolphin-js). It stores and synchronizes configuration data, discovers relevant dolphin peers, spawns, protects and repairs multiple pods of dolphin instances and provides core protocol nodes to multiple pods of dolphin instances when used in a single application.


## API

### comb

#### bee.comb.get(path)
[![Bee](https://img.shields.io/badge/process-Bee-yellow)](https://github.com/QuestNetwork/quest-bee-js)

Gets HoneyComb Object Or Array Of Objects.

```javascript
let comb = <os>.bee.comb.get('/my/path/to/the/object');
```

#### bee.comb.set(path,content)
[![Bee](https://img.shields.io/badge/process-Bee-yellow)](https://github.com/QuestNetwork/quest-bee-js)

Sets HoneyComb Object Or Array Of Objects.

```javascript
<os>.bee.comb.set('/my/path/to/the/object',content);
```

#### bee.comb.add(path,content)
[![Bee](https://img.shields.io/badge/process-Bee-yellow)](https://github.com/QuestNetwork/quest-bee-js)

Adds a HoneyComb object to an array of HoneyComb objects.

```javascript
<os>.bee.comb.add('/my/path/to/the/object',content);
```

#### bee.comb.search(path)
[![Bee](https://img.shields.io/badge/process-Bee-yellow)](https://github.com/QuestNetwork/quest-bee-js)

Searches for HoneyComb objects and returns a flat array of HoneyComb objects.

```javascript
let results = <os>.bee.comb.search('/my/path');
```

## Installation & Usage
```
npm install @questnetwork/quest-bee-js@0.9.4
```

## Roadmap

**0.9.6**
 - Uses [quest-star-rust](https://github.com/QuestNetwork/quest-star-rust) from NodeJS and Electron


## Support Us
This project is a lot of work and unfortunately we need to eat food (ツ)

| Ethereum| Bitcoin |
|---|---|
| `0xBC2A050E7B87610Bc29657e7e7901DdBA6f2D34E` | `bc1qujrqa3s34r5h0exgmmcuf8ejhyydm8wwja4fmq`   |
|  <img src="doc/images/eth-qr.png" >   | <img src="doc/images/btc-qr.png" > |

## License

GNU AGPLv3
