module.exports = {
  isAllSettled,
  isFulfilled,
  isRejected,
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
