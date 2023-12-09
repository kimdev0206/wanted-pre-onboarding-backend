const { faker } = require("@faker-js/faker");

require("dotenv").config();
const database = require("./database");
const { postRepository: repository } = require("../repositories");
const logger = require("../utils/logger");

function makePromise({ postSeq, superSeq }) {
  return repository.insertPostWithSeq({
    postSeq,
    superSeq,
    postTitle: faker.person.jobTitle(),
    postContent: faker.lorem.text(),
    userSeq: process.env.TEST_USER_SEQ,
  });
}

function makePostSeq(lv, seq) {
  return +(lv + "" + seq);
}

function makeBreadcrumbs({ lv, maxLv, promises, superSeq }) {
  if (lv === maxLv) return;

  const postSeq = makePostSeq(lv, lv - 1);
  promises.push(makePromise({ postSeq, superSeq }));

  makeBreadcrumbs({
    lv: lv + 1,
    maxLv,
    promises,
    superSeq: postSeq,
  });

  return promises;
}

function insertBreadcrumbs(maxLv) {
  const postSeq = 1;
  const lv = 0;

  const promises = makeBreadcrumbs({
    lv: lv + 1,
    maxLv,
    promises: [],
    superSeq: postSeq,
  });

  return Promise.allSettled(promises);
}

(function () {
  const maxLv = 1000;

  insertBreadcrumbs(maxLv)
    .then((values) =>
      logger.info(`게시글 ${values.length}개를 삽입하였습니다.`)
    )
    .catch((err) => logger.error(err.message))
    .finally(() => database.close());
})();
