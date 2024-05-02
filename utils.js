module.exports = {
  isAllSettled,
};

function isAllSettled(results) {
  return !results.some((result) => result.status === "rejected");
}
