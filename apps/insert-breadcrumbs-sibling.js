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

function makeSiblingPostSeq({ lv, prevLv, seq }) {
  return +(lv + "" + prevLv + seq.toString().padStart(3, "0"));
}

function makePostSeq({ lv, prevLv }) {
  return +(lv + "" + prevLv);
}

function makeBreadcrumbs({ lv, maxLv, maxSiblingSize, promises, superSeq }) {
  if (lv === maxLv) return;

  const prevLv = lv - 1;
  const postSeq = makePostSeq({ lv, prevLv });
  promises.push(makePromise({ postSeq, superSeq }));

  for (let seq = 1; seq < maxSiblingSize; seq++) {
    const postSeq = makeSiblingPostSeq({ lv, prevLv, seq });
    promises.push(makePromise({ postSeq, superSeq }));
  }

  makeBreadcrumbs({
    lv: lv + 1,
    maxLv,
    maxSiblingSize,
    promises,
    superSeq: postSeq,
  });

  return promises;
}

function insertBreadcrumbs({ maxLv, maxSiblingSize }) {
  const postSeq = 1;
  const lv = 0;

  const promises = makeBreadcrumbs({
    lv: lv + 1,
    maxLv,
    maxSiblingSize,
    promises: [makePromise({ postSeq, superSeq: null })],
    superSeq: postSeq,
  });

  return Promise.allSettled(promises);
}

(function () {
  const maxLv = 10;
  const maxSiblingSize = 100;

  insertBreadcrumbs({ maxLv, maxSiblingSize })
    .then((values) =>
      logger.info(`게시글 ${values.length}개를 삽입하였습니다.`)
    )
    .catch((err) => logger.error(err.message))
    .finally(() => database.close());
})();
