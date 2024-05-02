const { makePostPromise, makePostSeq } = require("./utils");
const database = require("../src/database");
const { isAllSettled } = require("../utils");

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
  try {
    const results = await run();

    if (!isAllSettled(results)) {
      const rejectedResults = results.filter(
        (result) => result.status === "rejected"
      );

      throw new Error(
        `${rejectedResults.length} 개의 게시글이 삽입 실패하였습니다.`
      );
    }

    console.log(`게시글 ${results.length} 개를 삽입하였습니다.`);
  } catch (error) {
    console.error(error);
  } finally {
    database.pool.end();
  }
})();
