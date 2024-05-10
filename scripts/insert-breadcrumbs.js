const path = require("node:path");
const {
  makePostHasClosurePromise,
  makePostPromise,
  makePostSeq,
} = require("./utils");
const database = require("../src/database");
const { isFulfilled, isRejected, perfTime } = require("../utils");

// NOTE: 변경 가능합니다.
const maxLv = 1000;
const userSeq = 1;

function make({ lv, superSeqs, postPromises, postHasClosurePromises }) {
  if (lv === maxLv) return;

  const postSeq = makePostSeq({ lv, seq: lv - 1 });
  postPromises.push(makePostPromise({ postSeq, userSeq }));

  const params = superSeqs.map((superSeq) => ({ superSeq, subSeq: postSeq }));
  const promise = makePostHasClosurePromise(params);

  postHasClosurePromises.push(promise);

  make({
    lv: lv + 1,
    superSeqs: [...superSeqs, postSeq],
    postPromises,
    postHasClosurePromises,
  });

  return { postPromises, postHasClosurePromises };
}

function run() {
  const postSeq = 1;

  const { postPromises, postHasClosurePromises } = make({
    lv: 1,
    superSeqs: [postSeq],
    postPromises: [],
    postHasClosurePromises: [],
  });

  return Promise.allSettled([
    Promise.allSettled(postPromises),
    Promise.allSettled(postHasClosurePromises),
  ]);
}

perfTime(async function () {
  try {
    var [{ value: postResults }, { value: postHasClosureResults }] =
      await run();

    var rejectedPostResults = postResults.filter(isRejected);
    var rejectedPostHasClosureResults =
      postHasClosureResults.filter(isRejected);

    const errors = [
      ...rejectedPostResults,
      ...rejectedPostHasClosureResults,
    ].map((result) => result.reason);

    errors.length && console.error(errors);
  } catch (error) {
    console.error(error);
  } finally {
    console.log(
      "[",
      [
        `성공 ${postResults.filter(isFulfilled).length} 개`,
        `유실 ${rejectedPostResults.length} 개`,
        `전체 ${postResults.length} 개`,
      ].join(", "),
      "]",
      "posts 테이블"
    );
    console.log(
      "[",
      [
        `성공 ${postHasClosureResults.filter(isFulfilled).length} 개`,
        `유실 ${rejectedPostHasClosureResults.length} 개`,
        `전체 ${postHasClosureResults.length} 개`,
      ].join(", "),
      "]",
      "post_has_closure 테이블"
    );

    database.pool.end();
  }
}, path.basename(__filename))();
