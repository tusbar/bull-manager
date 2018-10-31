# bull-manager [![CircleCI](https://circleci.com/gh/tusbar/bull-manager.svg?style=svg)](https://circleci.com/gh/tusbar/bull-manager)

> Easily manage your bull queues

[![npm version](https://badgen.net/npm/v/@tusbar/bull-manager)](https://www.npmjs.com/package/bull-manager)
[![dependencies Status](https://badgen.net/david/dep/tusbar/bull-manager)](https://david-dm.org/tusbar/bull-manager)
[![XO code style](https://badgen.net/badge/code%20style/XO/cyan)](https://github.com/xojs/xo)

## Getting started

```bash
$ yarn add bull-manager
```

## Usage

On the worker side:

```js
const {configureQueues, createJobQueue} = require('bull-manager')

configureQueues({
  isSubscriber: true,
  prefix: 'my-prefix',
  createRedis: type => {
    /* … */
  },
  onError: (job, error) => {
    console.error('An unexpected error happened')
  }
})

await createJobQueue('my-cool-job', job => {/* handler */}, {
  concurrency: 10,
  onError: (job, error) => {
    console.log('my cool job failed')
  }
}, {
  /* job options */
})
```

On the client side:

```js
const {configureQueues, joinJobQueue, enqueue} = require('bull-manager')

configureQueues({
  prefix: 'my-prefix',
  createRedis: type => {
    /* … */
  },
  onError: (job, error) => {
    console.error('An unexpected error happened')
  }
})

await joinJobQueue('my-cool-job', {
  /* job options */
})

await enqueue('my-cool-job', {
  something: 'important'
}, {
  /* job options */
})
```

## Cool features

### `jobIdKey`

Pass `jobIdKey` to job options so that `enqueue` will set the `jobId` to `_.get(data, jobIdKey)`.

### Fallthrough error handlers

Throwing in a job specific error handler will call the global error handler with that error.

## Random things

- You don’t need to pass job options to `createJobQueue` if you are never going to use `enqueue` in your workers.
- `removeOnComplete` is set to true by default.

## License

MIT


## Miscellaneous

```
    ╚⊙ ⊙╝
  ╚═(███)═╝
 ╚═(███)═╝
╚═(███)═╝
 ╚═(███)═╝
  ╚═(███)═╝
   ╚═(███)═╝
```
