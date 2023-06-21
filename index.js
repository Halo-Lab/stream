const STREAM = "@@stream";

export function from(source) {
  const stream = (sink) => {
    const stop = source(sink);

    return () => stop?.();
  };

  stream[STREAM] = stream;

  return stream;
}

export function isStream(value) {
  return typeof value === "function" && value === value[STREAM];
}

export function of(...values) {
  return from((push) => {
    const iterator = values[Symbol.iterator]();

    Promise.resolve().then(() => {
      for (const value of iterator) push(value);
    });

    return () => {
      iterator.return();
    };
  });
}

export function map(source, callback) {
  return callback
    ? from((push) => source((value) => push(callback(value))))
    : (anotherSource) => map(anotherSource, source);
}

export function filter(source, callback) {
  return callback
    ? from((push) => source((value) => callback(value) && push(value)))
    : (anotherSource) => filter(anotherSource, source);
}

export function forEach(source, callback) {
  return callback
    ? source(callback)
    : (anotherSource) => forEach(anotherSource, source);
}

export function scan(source, accumulator, reduce = accumulator) {
  return isStream(source)
    ? from((push) => {
        let created = true;
        let intermediate = accumulator;

        return source((value) => {
          push(
            (intermediate =
              created && intermediate === reduce
                ? value
                : reduce(intermediate, value))
          );

          if (created) created = false;
        });
      })
    : (anotherSource) => scan(anotherSource, source, accumulator);
}

export function take(source, amount) {
  let _amount = amount;

  return isStream(source)
    ? takeWhile(source, () => _amount-- > 0 || ((_amount = amount), false))
    : (anotherSource) => take(anotherSource, source);
}

export function takeWhile(source, callback) {
  return callback
    ? from((push) => {
        let stop;
        let cleared;

        const clear = () => {
          stop?.();
          stop = null;
          cleared = true;
        };

        stop = source(
          (value) => cleared || (callback(value) ? push(value) : clear())
        );

        return clear;
      })
    : (anotherSource) => takeWhile(anotherSource, source);
}

export function skip(source, amount) {
  return isStream(source)
    ? from((push) => {
        let _amount = amount;

        return source((value) => (_amount > 0 ? _amount-- : push(value)));
      })
    : (anotherSource) => skip(anotherSource, source);
}

export function skipWhile(source, callback) {
  return callback
    ? from((push) => {
        let skipping = true;

        return source((value) =>
          skipping ? (skipping = callback(value)) || push(value) : push(value)
        );
      })
    : (anotherSource) => skipWhile(anotherSource, source);
}

export function unique(source, selector, flushes) {
  return isStream(source)
    ? from((push) => {
        const keys = new Set();

        const stopFiltering = source((value) => {
          const key = selector?.(value) ?? value;

          if (!keys.has(key)) {
            keys.add(key);

            push(value);
          }
        });

        const stopFlushing = flushes?.(() => keys.clear());

        return () => {
          keys.clear();
          stopFiltering();
          stopFlushing?.();
        };
      })
    : (anotherSource) => unique(anotherSource, source, selector);
}

export function merge(source, other) {
  return other
    ? from((push) => {
        const stopSource = source(push);
        const stopOther = other(push);

        return () => {
          stopSource();
          stopOther();
        };
      })
    : (actualSource) => merge(actualSource, source);
}

export function distinct(source, compare = Object.is) {
  return isStream(source)
    ? from((push) => {
        let firstSent = false;
        let previous;

        return source((value) => {
          firstSent
            ? compare(previous, value) || push(value)
            : ((firstSent = true), push(value));

          previous = value;
        });
      })
    : (anotherSource) => distinct(anotherSource, source ?? compare);
}

export default {
  of,
  is: isStream,
  map,
  from,
  scan,
  take,
  skip,
  merge,
  filter,
  unique,
  forEach,
  distinct,
  skipWhile,
  takeWhile,
};
