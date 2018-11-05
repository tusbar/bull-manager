# bull-manager [![CircleCI](https://circleci.com/gh/tusbar/bull-manager.svg?style=svg)](https://circleci.com/gh/tusbar/bull-manager)

> Easily manage your bull queues

[![npm version](https://badgen.net/npm/v/bull-manager)](https://www.npmjs.com/package/bull-manager)
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

await enqueue('my-cool-job', 'job-name', {
  something: 'important'
}, {
  /* job options */
})
```

## API

### `configureQueues(options)`

Configure `bull-manager` by specifying the following `options`:

- `isManager`: set to `true` for workers. Defaults to `false`.
- `createRedis`: function that creates redis connections if you need custom options. Passing a function will enable connections reuse for `subscriber` and `client` connections. Defaults to `undefined`.
- `onError`: error handler that will be called for failed jobs when the corresponding queue doesn’t specify a custom error handler. Defaults to `undefined`.

### `createJobQueue(name, handler, options, jobOptions)`

Create a job queue and add the corresponding handler.

It takes the following `options`:

- `onError`: specific error handler that will be called when a job fails. Throwing withing the `onError` handler will invoke the global error handler (when defined) with the thrown error. Defaults to `undefined`.
- `concurrency`: amount of concurrent jobs per process. Defaults to `1`.

For `jobOptions`, refer to the [bull documentation](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd).

There is one additional job option:

- `jobIdKey`: `enqueue` will set the `jobId` to `_.get(data, jobIdKey)`

The default values are the same as in `Queue#add` except for `removeOnComplete` that will be `true`.

### `joinJobQueue(name, jobOptions)`

Join a job queue. Behaves like `createJobQueue` except that it does not register a handler.

### `enqueue(name, jobTitle, data, jobOptions)`

Add a job to the `name` jobQueue.

`jobTitle` is just a simple name to identify a job, it is not required. It will set `name` property to `data` if not set.

### `disconnectQueues()`

Run `Queue#disconnect` on all queues.

## Cool features

### `jobIdKey`

Pass `jobIdKey` to job options so that `enqueue` will set the `jobId` to `_.get(data, jobIdKey)`. Only works for `createJobQueue` and `joinJobQueue` job options, as it doesn’t make sense for `enqueue`. You always have the possibility to use `jobId` in `enqueue`, it will override anything else.

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
