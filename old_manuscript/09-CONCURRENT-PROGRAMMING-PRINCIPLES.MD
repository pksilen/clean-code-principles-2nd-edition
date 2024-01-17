# Concurrent Programming Principles

This chapter presents the following concurrent programming principles:

- Threading principle
- Thread safety principle

## Threading Principle

> Modern cloud-native microservices should primarily scale out by adding more processes, not scale up by adding more threads. Use threading only when it is needed or is a good optimization.

When developing modern cloud-native software, microservices should be stateless and automatically scale
horizontally (scaling out and in via adding and removing processes). The role of threading in modern cloud-native microservices is not as prominent as it was earlier when software
consisted of monoliths running on bare metal servers, mainly capable of scaling up or down. Nowadays, you should use threading if it is a good optimization or otherwise needed.

Suppose we have a software system with an event-driven architecture. Multiple microservices communicate with each other using asynchronous messaging. Each microservice instance has only a single thread that
consumes messages from a message broker and then processes them. If the message broker's message queue for a microservice starts growing too long, the microservice should scale out by adding a new instance. When the load for the microservice diminishes, it can scale in by removing an instance. There is no need to use threading at all.

We could use threading in the data exporter microservice if the input consumer and the output producer were synchronous. The reason for threading
is optimization. If we had everything in a single thread and the microservice was performing network I/O (either input or output-related), the microservice would have
nothing to execute because it is waiting for some network I/O to complete. Using threads, we can optimize the execution of the microservice so that it potentially has something
to do when waiting for an I/O operation to complete.

Many modern input consumers and output producers are available as asynchronous implementations. If we use an asynchronous consumer and producer
in the data exporter microservice, we can eliminate threading because network I/O will not block the execution of the main thread anymore. As a rule
of thumb, consider using asynchronous code first, and if it is not possible or feasible, only then consider threading.

You might need a microservice to execute housekeeping tasks on a specific schedule in the background. Instead of using threading and implementing the housekeeping functionality
in the microservice, consider implementing it in a separate microservice to ensure that the _single responsibility principle_ is followed.
You can configure the housekeeping microservice to be run at regular intervals using a Kubernetes CronJob, for example.

Threading also brings complexity to a microservice because the microservice must ensure thread safety. You will be in big trouble if you forget to implement thread safety. Threading and synchronization-related bugs are hard to find.
Thread safety is a topic that is discussed later in this chapter. Threading also brings complexity to deploying a microservice because the number of vCPUs requested by the microservice can depend on the thread count.

### Parallel Algorithms

Parallel algorithms are similar to threading. With parallel algorithms, it is a question about implicit threading instead of explicit threading. Threads are created behind the scenes to enable an algorithm to execute
in parallel on some data set. A parallel algorithm is usually something you don't necessarily need in a cloud-native microservice.
You can often run algorithms without parallelization and instead scale out on demand.

Many languages offer parallel algorithms. In Java, you can perform parallel operations with a parallel stream created with the `parallelStream` method:

<div class="sourceCodeWithoutLabel">

```
final var numbers = List.of(1, 2, 3, 4);
numbers.parallelStream().forEach(number ->
  System.out.println(number + " " +
                     Thread.currentThread().getName())
);
```

</div>

The output of the above code could be, for example:

```
3 ForkJoinPool.commonPool-worker-2
2 ForkJoinPool.commonPool-worker-1
1 ForkJoinPool.commonPool-worker-3
4 main
```

The output will differ on each run. Usually, the parallel executor creates the same amount of threads as there are CPU cores available. This means
that you can scale your microservice up by requesting more CPU cores.
In many languages, you can control how many CPU cores the parallel algorithm should use. You can, for example, configure that
a parallel algorithm should use the number of available CPU cores minus two if you have two threads dedicated to some other processing.
In C++20, you cannot control the number of threads for a parallel algorithm, but an improvement is coming in a future C++ release.

Below is the same example as above written in C++:

<div class="sourceCodeWithoutLabel">

```
#include <algorithm>
#include <execution>
#include <thread>
#include <iostream>

std::vector<int> numbers{1, 2, 4, 5};

std::for_each(std::execution::par,
              numbers.cbegin(),
              numbers.cend(),
              [](const auto number)
              {
                std::cout << number
                          << " "
                          << std::this_thread::get_id()
                          << "\n";
              });
```

</div>

## Thread Safety Principle

> If you are using threads, you must ensure thread safety. Thread safety means that only one thread can access shared data simultaneously to avoid race conditions.

Do not assume thread safety if you use a data structure or library. You must consult the documentation to see whether thread safety is guaranteed. If thread safety is not mentioned in the documentation, it can't be assumed. The best way to communicate thread safety to developers is to name things so that
thread safety is explicit. For example, you could create a thread-safe collection library and have a class named `ThreadSafeLinkedList` to indicate the class
is thread-safe. Another common word used to indicate thread safety is _concurrent_, e.g., the `ConcurrentHashMap` class in Java.

There are several ways to ensure thread safety:

- Synchronization directive
- Atomic variables
- Concurrent collections
- Mutexes
- Spin locks

The subsequent sections describe each of the above techniques in more detail.

### Synchronization Directive

In some languages, you can use a specific directive to indicate that a particular piece of code is synchronized, meaning that
only one thread can execute that piece of code at a time.

Java offers the `synchronized` keyword that can be used in the following ways:

- Synchronized instance method
- Synchronized static method
- Synchronized code block

<div class="sourceCodeWithoutLabel">

```
public synchronized void doSomething() {
  // Only one thread can execute this at the same time
}

public static synchronized void doSomething() {
  // Only one thread can execute this at the same time
}

public void doSomething() {
  // ...
  
  synchronized (this) {
    // Only one thread can execute this at the same time
  }
  
  // ...
}
```
</div>

### Atomic Variables

If you have some data shared between threads and that data is just a simple primitive variable, like a boolean or integer,
you can use an atomic variable to guarantee thread safety and don't need to use any additional synchronization technique. Atomic variable reads and updates
are guaranteed to be atomic, so there is no possibility for a race condition between two threads. Some atomic variable implementations use locks.
Consult the language's documentation to see if a certain atomic type is guaranteed to be lock-free.

In C++, you can create a thread-safe counter using an atomic variable:

_ThreadSafeCounter.h_
```
#include <atomic>

class ThreadSafeCounter 
{
public:
  ThreadSafeCounter() = default;

  void increment() 
  {
    ++m_counter;
  }

  uint32_t getValue() const
  {
    return m_counter.load();
  }

private:
  std::atomic<uint64_t> m_counter{0U};
}
```

Multiple threads can increment a counter of the above type at the same time without a need for additional synchronization.

### Concurrent Collections

Concurrent collections can be used by multiple threads without any additional synchronization.
Java offers several concurrent collections in the `java.util.concurrent` package.

C++ does not offer concurrent collections in its standard library. You can create a concurrent, i.e., a
thread-safe collection using the _decorator pattern_ by adding needed synchronization (locking) to an existing collection class. Below is
a partial example of a thread-safe vector created in C++:

_ThreadSafeVector.h_
```
#include <vector>

template <typename T>
class ThreadSafeVector
{
public:
  explicit ThreadSafeVector(std::vector<T>&& vector):
    m_vector{std::move(vector)}
  {}

  void pushBack(const T& value)
  {
    // Lock using a mutex or spin lock 
    
    m_vector.push_back(value);
    
    // Unlock
  }

  // Implement other methods with locking...

private:
  std::vector<T> m_vector;
};
```

### Mutexes

A mutex is a synchronization primitive that can protect shared data from being simultaneously accessed by multiple threads.
A mutex is usually implemented as a class with `lock` and `unlock` methods. The locking only succeeds by one thread at a time. Another
thread can lock the mutex only after the previous thread has unlocked the mutex. The `lock` method waits until the mutex becomes
available for locking.

Let's implement the `pushBack` method using a mutex:

_ThreadSafeVector.h_
```
#include <mutex>
#include <vector>

template <typename T>
class ThreadSafeVector
{
public:
  explicit ThreadSafeVector(std::vector<T>&& vector):
    m_vector{std::move(vector)}
  {}

  void pushBack(const T& value)
  {
    m_mutex.lock();
    m_vector.push_back(value);
    m_mutex.unlock();
  }

  // Implement other methods ...

private:
  std::vector<T> m_vector;
  std::mutex m_mutex;
};
```

Mutexes are not usually used directly because there exists the risk that a mutex is forgotten to be unlocked.
Instead of using the plain `std::mutex` class, you can use a mutex with the `std::scoped_lock` class. The `std::scoped_lock`
class wraps a mutex instance. It will lock the wrapped mutex on construction
and unlock the mutex on destruction. In this way, you cannot forget to unlock a locked mutex. The mutex will be locked for
the scope of the scoped lock variable. Below is the above example modified to use a scoped lock:

_ThreadSafeVector.h_
```
#include <mutex>
#include <vector>

template <typename T>
class ThreadSafeVector
{
public:
  explicit ThreadSafeVector(std::vector<T>&& vector):
    m_vector{std::move(vector)}
  {}

  void pushBack(const T& value)
  {
    const std::scoped_lock scopedLock{m_mutex};
    m_vector.push_back(value);
  }

  // Implement other methods ...

private:
  std::vector<T> m_vector;
  std::mutex m_mutex;
};
```

### Spinlocks

A spinlock is a lock that causes a thread trying to acquire it to simply wait in a loop (spinning the loop) while repeatedly checking whether the lock has become available.
Since the thread remains active but is not performing a useful task, using a spinlock is busy waiting. You can avoid some of the overhead of thread context switches using a spinlock. Spinlocks are an effective way of locking if the locking periods are short.

Let's implement a spinlock using C++:

_Spinlock.h_
```
#include <atomic>
#include <thread>

#include <boost/core/noncopyable.hpp>

class Spinlock : public boost::noncopyable
{
public:
  void lock()
  {
    while (true) {
      const bool wasLocked =
        m_isLocked.test_and_set(std::memory_order_acquire);
        
      if (!wasLocked) {
        // Is now locked
        return;
      }

      // Wait for the lock to be released 
      while (m_isLocked.test(std::memory_order_relaxed)) {
        // Prioritize other threads
        std::this_thread::yield();  
      }
    }
  }

  void unlock()
  {
    m_isLocked.clear(std::memory_order_release);
  }

private:
  std::atomic_flag m_isLocked = ATOMIC_FLAG_INIT;
};
```

In the above implementation, we use the `std::atomic_flag` class because it guarantees a lock-free implementation across all C++ compilers.
We also use a non-default memory ordering to allow the compiler to emit more efficient code.

Now we can re-implement the `ThreadSafeVector` class using a spinlock instead of a mutex:

_ThreadSafeVector.h_
```
#include <vector>
#include "Spinlock.h"

template <typename T>
class ThreadSafeVector
{
public:
  explicit ThreadSafeVector(std::vector<T>&& vector):
    m_vector{std::move(vector)}
  {}

  void pushBack(const T& value)
  {
    m_spinlock.lock();
    m_vector.push_back(value);  
    m_spinlock.unlock();
  }

  // Implement other methods ...

private:
  std::vector<T> m_vector;
  Spinlock m_spinlock;
};
```

Similar to mutexes, we should not use raw spinlocks in our code but use a scoped lock.
Below is an implementation of a generic `ScopedLock` class that handles the locking
and unlocking of a lockable object:

_ScopedLock.h_
```
#include <concepts>

#include <boost/core/noncopyable.hpp>

template<typename T>
concept Lockable = requires(T a)
{
    { a.lock() } -> std::convertible_to<void>;
    { a.unlock() } -> std::convertible_to<void>;
};

template <Lockable L>
class ScopedLock : public boost::noncopyable
{
public:
  explicit ScopedLock(L& lockable): 
    m_lockable{lockable}
  {
    m_lockable.lock();
  }

  ~ScopedLock()
  {
    m_lockable.unlock();
  }

private:
  L& m_lockable;
};
```

Let's change the `ThreadSafeVector` class to use a scoped lock:

_ThreadSafeVector.h_
```
#include <vector>
#include "Scopedlock.h"
#include "Spinlock.h"

template <typename T>
class ThreadSafeVector
{
public:
  explicit ThreadSafeVector(std::vector<T>&& vector):
    m_vector{std::move(vector)}
  {}

  void pushBack(const T& value)
  {
    const ScopedLock scopedLock{m_spinlock};
    m_vector.push_back(value);  
  }

  // Implement other methods ...

private:
  std::vector<T> m_vector;
  Spinlock m_spinlock;
};
```

