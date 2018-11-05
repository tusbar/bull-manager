const Queue = require('bull')
const _ = require('lodash')

let queues = {}
let globalOptions = {
  isSubscriber: false
}
let client = null
let subscriber = null

function configureQueues(options) {
  globalOptions = {
    ...globalOptions,
    ...options
  }

  if (globalOptions.createRedis) {
    client = globalOptions.createRedis()

    if (globalOptions.isSubscriber) {
      subscriber = globalOptions.createRedis()
    }
  }
}

const _createQueue = (name, jobOptions) => {
  jobOptions = {
    removeOnComplete: true,
    ...jobOptions
  }

  const queue = new Queue(name, {
    createClient: globalOptions.createRedis ? type => {
      switch (type) {
        case 'client':
          return client
        case 'subscriber':
          if (!globalOptions.isSubscriber) {
            throw new Error('Subscriber queue was needed in client mode')
          }
          return subscriber
        default:
          return globalOptions.createRedis()
      }
    } : undefined,
    prefix: globalOptions.prefix
  })

  queues[name] = {
    queue,
    jobOptions
  }

  return queue
}

async function createJobQueue(name, handler, options, jobOptions) {
  if (!globalOptions.isSubscriber) {
    throw new Error('Cannot create a job queue in client mode')
  }

  if (name in queues) {
    throw new Error(`Job queue "${name}" already exists`)
  }

  const queue = _createQueue(name, jobOptions)

  options = {
    concurrency: 1,
    ...options
  }

  queue.process(options.concurrency, handler)

  if (globalOptions.onError && options.onError) {
    queue.on('failed', async (job, error) => {
      try {
        await options.onError(job, error)
      } catch (error2) {
        return globalOptions.onError(job, error2)
      }
    })
  } else if (globalOptions.onError) {
    queue.on('failed', globalOptions.onError)
  } else if (options.onError) {
    queue.on('failed', options.onError)
  }

  await queue.isReady()
  return queue
}

async function joinJobQueue(name, jobOptions) {
  const queue = _createQueue(name, jobOptions)

  await queue.isReady()
  return queue
}

function enqueue(name, jobTitle, data, options) {
  if (!(name in queues)) {
    throw new Error(`Job queue "${name}" does not exist`)
  }

  if (typeof jobTitle !== 'string') {
    data = jobTitle
    options = data
    jobTitle = undefined
  }

  const {
    queue,
    jobOptions: {jobIdKey, ...jobOptions}
  } = queues[name]

  options = {
    ...jobOptions,
    jobId: jobIdKey ? _.get(data, jobIdKey) : undefined,
    ...options
  }

  if (jobTitle) {
    data = {
      name: jobTitle,
      ...data
    }
  }

  return queue.add(data, options)
}

async function disconnectQueues() {
  await Promise.all(
    Object.values(queues).map(({queue}) => queue.close())
  )

  queues = {}
  client = null
  subscriber = null
}

module.exports = {
  configureQueues,
  createJobQueue,
  joinJobQueue,
  enqueue,
  disconnectQueues
}
