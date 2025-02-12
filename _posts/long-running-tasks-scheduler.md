---
title: "Building a Scalable Long-Running Task Scheduler with Amplify, ECS, and Fargate"
excerpt: "How we implemented a robust solution for handling long-running export tasks using AWS ECS and Fargate, overcoming Lambda's limitations to provide reliable, scalable background processing."
coverImage: "/assets/posts/long-running-tasks-scheduler/cover.jpg"
date: "2025-02-12T07:33:10-04:00"
author: jseun
ogImage:
  url: "/assets/posts/long-running-tasks-scheduler/cover.jpg"
---

At Picketa, we recently faced an interesting challenge: how to efficiently handle long-running export tasks for our agricultural data platform. This blog post dives into our journey of building a custom task scheduler using AWS Amplify, ECS, and Fargate, and why we chose this architecture over other AWS services.

## The Challenge

Our users needed the ability to export crop year data in various formats (PDF, Excel) with the flexibility to combine multiple reports into a single compressed file. The key requirements were:

- Asynchronous processing of potentially large data exports
- Ability to track job progress and status
- Secure storage and access to exported files
- Scalability to handle concurrent exports
- Reliability for long-running tasks (potentially hours)

## Why Not Lambda?

While AWS Lambda might seem like the obvious choice for serverless task processing, we encountered two critical limitations:

1. **Execution Time Limit**: Lambda functions have a maximum runtime of 15 minutes
2. **Package Size Constraint**: The total deployment package size cannot exceed 250MB

These constraints made Lambda unsuitable for our use case, as some tasks could take more than 15 minutes to complete and our dependencies alone exceeded the size limit (we're using NodeJS modules, which always end up taking a significant portion of the package size).

## Our Solution: ECS + Fargate

We implemented our task scheduler using the following architecture:

### Key Components

1. **Job Queue**: A persistent queue to track all export jobs
2. **Worker Processes**: Containerized workers that process jobs
3. **Circuit Breaker**: A safety mechanism to prevent infinite retries
4. **Distributed Locking**: Ensures only one worker processes a job at a time

### Workflow Overview

1. User submits export request through API
2. System validates request and creates job record
3. Worker picks up job and begins processing
4. System tracks progress and updates status
5. Completed files are stored in S3 with signed URLs
6. User receives notification when export is ready

### Implementation Details

Our implementation includes several key features:

- **Job Status Tracking**: Real-time updates on job progress
- **Graceful Shutdown**: Handles SIGTERM signals during deployments
- **Scalable Workers**: Can scale horizontally based on workload
- **Secure Access**: Uses signed URLs for file downloads

## Configuring Amplify for ECS and Fargate

Before diving into the implementation details, we need to configure Amplify to support ECS and Fargate deployments. By default, Amplify doesn't expose these advanced configurations, but we can unlock them using this command:

```bash
$ amplify configure project

? Which setting do you want to configure? 
  Project information 
  AWS Profile setting 
❯ Advanced: Container-based deployments 
```

Then we have access to more advanced configurations for creating API services.
```
% amplify add api

? Select from one of the below mentioned services: REST
✔ Would you like to add a new path to an existing REST API: (y/N) · no
? Which service would you like to use 
  API Gateway + Lambda 
❯ API Gateway + AWS Fargate (Container-based) 
```

## Docker Configuration

Since we're using ECS and Fargate, we need to containerize our worker service. Here's our `Dockerfile` for the worker:

```dockerfile
FROM public.ecr.aws/bitnami/node:22.8.0-debian-12-r2 AS base
WORKDIR /app
RUN corepack enable
RUN corepack install --global pnpm@9.5.0
ENV PNPM_HOME=/pnpm
ENV PATH="$PATH:$PNPM_HOME"
RUN pnpm add -g turbo@^2

FROM base AS builder
COPY . .
RUN turbo prune @lens-backend/worker --docker

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=@lens-backend/worker...

FROM base AS runner
WORKDIR /app

COPY --from=installer /app .

CMD ./node_modules/.bin/dotenvx run -f apps/worker/.env.production -- node apps/worker/dist
```

The Dockerfile above leverages Turborepo's powerful monorepo tooling to efficiently build our worker service. Let's break down the key steps:

1. **Pruning the Monorepo**: 
   ```bash
   RUN turbo prune @lens-backend/worker --docker
   ```
   This command creates a subset of our monorepo containing only the worker app and its dependencies. It produces two directories:
   - `out/json`: Contains the pruned workspace's package.json files
   - `out/full`: Contains all the source files needed to build the worker

2. **Optimized Installation**:
   We first copy and install just the pruned package.json files, which includes only the dependencies needed for the worker. This step is cached as long as dependencies don't change, significantly speeding up builds.

3. **Filtered Build**:
   ```bash
   RUN pnpm turbo run build --filter=@lens-backend/worker...
   ```
   The `--filter` flag ensures we only build the worker and its dependencies, ignoring other apps in the monorepo. The `...` suffix indicates we want to include all dependencies of the worker.

This multi-stage build process ensures our final image contains only the necessary code and dependencies for the worker service, keeping the image size small and build times fast.

## Worker Job Queue

Workers work on jobs and progress through several states:
1. **PENDING**: Initial state, ready for processing
2. **RUNNING**: Currently being processed by a worker
3. **COMPLETED**: Successfully finished
4. **FAILED**: Failed after exceeding retry attempts

### Worker Thread
The worker thread is responsible for executing tasks and managing their lifecycle. Here's the core implementation:

```javascript
export const runWorkerThread = (session) => {
  parentPort.on('message', async (message) => {
    const { job, context } = message;
    switch (message.type) {
      case MESSAGE_TYPE.SHUTDOWN:
        await handleShutdown();
        break;
      case MESSAGE_TYPE.NEW_JOB:
        await handleNewJob(session, job, { context });
        break;
      case MESSAGE_TYPE.CONTINUE_JOB:
        await handleContinueJob(session, job, { context });
        break;
      default:
        logger.error('unhandled message type', { message });
    }
  });
};
```

The worker thread handles three types of messages:

1. **New Jobs** (`MESSAGE_TYPE.NEW_JOB`):
   ```javascript
   const handleNewJob = async (session, job, { context }) => {
     // Acquire an exclusive lock on the job
     const acquiredJob = await acquireJobV1(session, {
       jobId: job.id,
       unlockAfterSeconds: JOB_UNLOCK_AFTER_SECONDS,
       circuitBreakerThreshold: JOB_CIRCUIT_BREAKER_THRESHOLD,
     });
     
     // Run the task with a deadline
     const { status, context: latestContext } = await runTask(acquiredJob, {
       deadline: JOB_UNLOCK_AFTER_SECONDS,
       context,
     });
     
     // Report back the results
     parentPort.postMessage({ status, context: latestContext, job: acquiredJob });
   };
   ```

2. **Continuing Jobs** (`MESSAGE_TYPE.CONTINUE_JOB`):
   ```javascript
   const handleContinueJob = async (session, job, { context }) => {
     // Update the job's lock timeout
     const continuedJob = await updateJobV1(session, job, {
       unlockAfter: Math.floor(Date.now() / 1000) + JOB_UNLOCK_AFTER_SECONDS,
     });
     
     // Continue task execution
     const { status, context: latestContext } = await runTask(continuedJob, {
       deadline: JOB_UNLOCK_AFTER_SECONDS,
       context,
     });
     
     // Report back the results
     parentPort.postMessage({ status, context: latestContext, job: continuedJob });
   };
   ```

3. **Shutdown** (`MESSAGE_TYPE.SHUTDOWN`):
   Gracefully terminates the worker by:
   - Aborting any running task
   - Allowing cleanup operations
   - Exiting the process

This implementation provides:
1. **Job Locking**: Ensures exclusive access to jobs using a timeout-based locking mechanism
2. **Task Continuation**: Allows long-running tasks to be executed in chunks while maintaining state
3. **Graceful Shutdown**: Enables clean process termination during scaling events
4. **Error Handling**: Reports failures back to the main thread for proper error management

### Task Scheduling Strategy

Our task scheduling implements a unique "grab and release" pattern that ensures concurrency safety. Given each job are locked to be worked on by at most one worker, we need the task promise to be canceled after a deadline. Additionally, we use a plugin-based architecture that allows us to easily add new types of long-running tasks.

#### Plugin-Based Task Handlers

Task handlers are registered as plugins using a simple registration system:

```javascript
const registerTask = (type, { taskHandler, taskAborter }) => {
  if (!tasks[type]) {
    tasks[type] = { taskHandler, taskAborter };
    if (isMainThread) logger.info('new task handler registered', { type });
  }
};
```

Each task handler must implement a specific interface. Here's an example from our analyses export task handler:

```javascript
const taskHandler = async (session, job, { signal, context: initialContext }) => {
  let context = structuredClone(initialContext);
  // ... task implementation ...
  
  if (signal.aborted) {
    return { error: new Error('the task handler was aborted before execution') };
  }

  // Process a batch of reports
  const batchEntries = context.remainingKeys.splice(0, MAX_GENERATE_BATCH_SIZE);
  const results = await Promise.allSettled(
    batchEntries.map((key) => fetchAndSaveReport({
      session,
      storageClient,
      jobId: exportAnalysesJob.id,
      key,
      entry,
      criticalLevels,
    }))
  );

  // Return status and context for next iteration
  return { 
    status: JOB_STATUS.RUNNING, 
    context 
  };
};

// Register the task handler
registerTask(JOB_TYPE.EXPORT_ANALYSES, { 
  taskHandler, 
  taskAborter 
});
```

The task handler:
1. Receives a session, job details, and abort signal
2. Processes a batch of work (in this case, report generation)
3. Returns the current status and context for the next iteration
4. Can be gracefully aborted using the signal

This plugin architecture allows us to:
- Add new types of long-running tasks without modifying the core scheduler
- Maintain clean separation of concerns
- Easily test and maintain individual task handlers

#### Time-Boxing Implementation

The core of our task scheduling reliability is the `cancelableExpiringPromise` pattern, which ensures tasks can't run indefinitely:

```javascript
const cancelableExpiringPromise = (promise, controller, timeout, timeoutFn) => {
  const timeoutPromise = new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      controller.abort();
      resolve(timeoutFn());
    }, timeout);
    promise.finally(() => clearTimeout(timeoutId));
  });
  return Promise.race([promise, timeoutPromise]);
};
```

This pattern is used in our task execution system to enforce time limits and enable graceful cancellation:

```javascript
export const runTask = async (job, { deadline = 10, context }) => {
  const abortController = new AbortController();
  const { signal } = abortController;
  
  // Create a time-boxed promise for the task
  const { promise, cancel } = cancelableExpiringPromise(
    taskHandler(session, job, { signal, context }),
    abortController,
    deadline * 1000,  // Convert deadline to milliseconds
    () => {
      logger.debug('task took too long to complete', { deadline });
      return { error: TaskTimeoutException };
    }
  );

  // Set up abort handler for graceful shutdown
  abortTask = async () => {
    logger.debug('aborting task');
    cancel();
    const { taskAborter } = tasks[job.type];
    if (taskAborter) await taskAborter(session, job);
    return job;
  };

  try {
    // Execute the task with timeout
    const { status, error, context: latestContext } = await promise;
    if (error) throw error;
    
    // Refresh session if task is continuing
    if (status === JOB_STATUS.RUNNING) {
      await refreshJobAuthorizationV1(session, job);
    }
    
    return { status, context: latestContext };
  } finally {
    abortTask = async () => null;
  }
};
```

This implementation provides several key features:

1. **Time Limits**: Tasks are automatically terminated if they exceed their deadline
2. **Graceful Cancellation**: Tasks receive an abort signal and can clean up resources
3. **Session Management**: Long-running tasks maintain their authentication state
4. **Context Preservation**: Task state is preserved between executions
5. **Error Handling**: Failed tasks can be retried with their previous context

The combination of time-boxing and the plugin architecture allows us to:
- Prevent tasks from running indefinitely
- Enforce a design pattern for task execution to gracefully recover from failures

### Main Thread Orchestrator

The main thread is responsible for managing the worker pool and coordinating job distribution. Here's how it works:

```javascript
export const runMainThread = (session, filename) => {
  const state = {
    shutdown: 0,
    availableWorkers: [],
    contexts: {},
  };
  const workers = createWorkers({ 
    filename, 
    queueSize: WORKER_QUEUE_SIZE, 
    session, 
    state 
  });
  
  // Set up polling intervals for job management
  const newJobsIntervalId = setInterval(
    () => pollForNewJobs(session, state),
    NEW_JOB_POLL_INTERVAL * 1000
  );
  const staleJobsIntervalId = setInterval(
    () => pollForStaleJobs(session),
    STALE_JOB_POLL_INTERVAL * 1000
  );
};
```

The orchestrator maintains a pool of workers and implements two critical polling mechanisms:
1. **New Jobs Poll**: Regularly checks for new pending jobs to process
2. **Stale Jobs Poll**: Identifies and recovers jobs that may have been interrupted but never retried again

### Crash Resistance and Recovery

Our system implements several mechanisms to handle failures:

```javascript
const handleJobFailed = async ({ ll, session, job, errorMessage, state }) => {
  if (state.shutdown) {
    // Release job on shutdown for later processing
    const updatedJob = await updateJobV1(session, job, {
      status: JOB_STATUS.PENDING,
    });
    return { canRetry: false };
  }
  
  if (job.circuitBreaker + 1 > JOB_CIRCUIT_BREAKER_THRESHOLD) {
    // Prevent infinite retries with circuit breaker
    const updatedJob = await updateJobV1(session, job, {
      status: JOB_STATUS.FAILED,
      error: errorMessage,
    });
    return { canRetry: false };
  }
  
  // Increment circuit breaker and retry
  const updatedJob = await updateJobV1(session, job, {
    circuitBreaker: job.circuitBreaker + 1,
    status: JOB_STATUS.PENDING,
  });
  return { canRetry: true };
};
```

Key recovery features include:
1. **Circuit Breaker**: Prevents infinite retry loops
2. **Graceful Shutdown**: Preserves job state during system updates
3. **Stale Job Recovery**: Automatically reclaims abandoned jobs
4. **Context Preservation**: Maintains job progress across retries

### Scaling and Container Management

The system is designed to work seamlessly with ECS and Fargate:

```javascript
const setupCleanupHandlers = (workers, state, teardown) => {
  const cleanup = () => {
    state.shutdown += 1;
    if (state.shutdown < 2) {
      teardown();
      workers.forEach((worker) => {
        worker.postMessage({ type: MESSAGE_TYPE.SHUTDOWN });
      });
    }
  };
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
};
```

This implementation:
1. Handles container scaling events gracefully
2. Responds to SIGTERM/SIGINT signals
3. Ensures task handlers can cleanup up before shutdown

## Benefits of Our Approach

This architecture provides several advantages:

- **No Time Limits**: Tasks can run as long as needed (they just need to renew a lease on the lock)
- **Scalability**: Easily adjust worker capacity based on demand
- **Reliability**: Built-in retry and error handling
- **Portability**: Containerized solution works across cloud providers

## Conclusion

By leveraging ECS and Fargate, we've created a robust solution for handling long-running export tasks. This architecture provides the scalability and reliability our users need while maintaining the flexibility to adapt to future requirements. As we continue to grow, we're excited to build on this foundation and explore new ways to improve our data export capabilities.

Stay tuned for more technical deep dives into our platform's architecture!
