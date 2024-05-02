const { performance } = require("node:perf_hooks");
const { makePostPromise, makePostSeq } = require("./utils");
const database = require("../src/database");
const { isFulfilled, isRejected } = require("../utils");

// NOTE: 변경 가능합니다.
const maxLv = 1000;
const userSeq = 1;

function make({ lv, superSeq, promises }) {
  if (lv === maxLv) return;

  const postSeq = makePostSeq({ lv, seq: lv - 1 });
  promises.push(makePostPromise({ postSeq, superSeq, userSeq }));

  make({
    lv: lv + 1,
    superSeq: postSeq,
    promises,
  });

  return promises;
}

function run() {
  const postSeq = 1;

  const promises = make({
    lv: 1,
    superSeq: postSeq,
    promises: [],
  });

  return Promise.allSettled(promises);
}

(async function () {
  const startTime = performance.now();

  try {
    var results = await run();
    var rejectedResults = results.filter(isRejected);

    const errors = rejectedResults.map((result) => result.reason);
    errors.length && console.error(errors);
  } catch (error) {
    console.error(error);
  } finally {
    const endTime = performance.now();
    const perfTime = Math.round(endTime - startTime);

    console.log(
      "[",
      [
        `성공 ${results.filter(isFulfilled).length} 개`,
        `유실 ${rejectedResults.length} 개`,
        `전체 ${results.length} 개`,
      ].join(", "),
      "]",
      "posts 테이블"
    );
    console.log(
      `Call to "node scripts/insert-breadcrumbs.js" took ${perfTime} ms`
    );

    database.pool.end();
  }
})();
