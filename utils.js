const { performance } = require("node:perf_hooks");

module.exports = {
  isAllSettled,
  isFulfilled,
  isRejected,
  perfTime,
};

function isAllSettled(results) {
  return !results.some((result) => result.status === "rejected");
}

function isFulfilled(result) {
  return result.status === "fulfilled";
}

function isRejected(result) {
  return result.status === "rejected";
}

function perfTime(func, name) {
  return function (...args) {
    const startTime = performance.now();

    func.apply(this, args);

    const endTime = performance.now();
    const perfTime = Math.round(endTime - startTime);

    console.log(`Call to "${name}" took ${perfTime} ms`);
  };
}
