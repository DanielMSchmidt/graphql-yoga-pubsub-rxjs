import { Observable } from "rxjs";
import { $$asyncIterator } from "iterall";

function iterify<T>(val: T): IteratorResult<T> {
  return {
    value: val,
    done: false
  };
}

type PromiseResolve<T> = (val: IteratorResult<T>) => void;
export default function observableToIterator<T>(
  obs: Observable<T>
): AsyncIterator<T> {
  const pullQueue: IteratorResult<T>[] = []; // Observable emits faster than iterator consumes
  const pushQueue: PromiseResolve<T>[] = []; // Iterator asks more than Observable emits

  const subscription = obs.subscribe(
    function onNext(val) {
      const promiseResolve = pushQueue.shift();
      if (promiseResolve) {
        promiseResolve(iterify(val));
      } else {
        pullQueue.push(iterify(val));
      }
    },
    function onError(error) {
      pullQueue.length = 0;
      pushQueue.length = 0;

      throw error;
    },
    function onComplete() {
      if (pushQueue.length) {
        const promiseResolve = pushQueue.shift();
        // @ts-ignore TS types for iterators are wrong
        promiseResolve({ done: true });
      } else {
        // @ts-ignore TS types for iterators are wrong
        pullQueue.push({ done: true });
      }
    }
  );

  return {
    next() {
      const item = pullQueue.shift();

      if (item) {
        return Promise.resolve(item);
      } else {
        return new Promise(resolve => {
          pushQueue.push(resolve);
        });
      }
    },

    // @ts-ignore
    return() {
      subscription.unsubscribe();
      return Promise.resolve({ done: true });
    },

    [$$asyncIterator]() {
      return this;
    }
  };
}
