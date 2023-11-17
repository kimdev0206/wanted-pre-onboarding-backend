const { faker } = require("@faker-js/faker");
const util = require("node:util");

require("dotenv").config();
const database = require("./database");
const makeUserRepository = require("../repositories/post-repository");
const logger = require("../utils/logger");

Array.prototype.shuffle = function () {
  let curIdx = this.length;
  let rdmIdx;

  while (curIdx > 0) {
    rdmIdx = Math.floor(Math.random() * curIdx);
    curIdx -= 1;

    [this[curIdx], this[rdmIdx]] = [this[rdmIdx], this[curIdx]];
  }

  return this;
};

function makePromise({ postSeq, parentSeq, repository }) {
  return repository.insertPostWithSeq({
    postSeq,
    parentSeq,
    postTitle: faker.person.jobTitle(),
    postContent: faker.lorem.text(),
    userSeq: process.env.TEST_USER_SEQ,
  });
}

function makePostSeq(lv, seq) {
  return +(lv - 1 + "" + seq);
}

function getRdmSiblingSize(siblingSizes) {
  return siblingSizes[Math.floor(siblingSizes.length * Math.random())];
}

function makeBreadcrumbs({
  lv,
  maxLv,
  visited,
  promises,
  repository,
  siblingSizes,
  breadcrumbs,
  parentSeq,
}) {
  if (lv === maxLv) return;

  const siblingSize = getRdmSiblingSize(siblingSizes);

  for (let i = 1; i <= siblingSize; i++) {
    const postSeq = makePostSeq(lv, i);

    if (!visited.has(postSeq)) {
      visited.add(postSeq);
      breadcrumbs.set(postSeq, new Map());
      promises.push(makePromise({ postSeq, parentSeq, repository }));

      makeBreadcrumbs({
        lv: lv + 1,
        maxLv,
        visited,
        promises,
        repository,
        siblingSizes,
        breadcrumbs: breadcrumbs.get(postSeq),
        parentSeq: postSeq,
      });
    }
  }

  return promises;
}

function insertBreadcrumbs(maxLv, maxSiblingSize) {
  const repository = makeUserRepository(database);
  const siblingSizes = Array.from(
    { length: maxSiblingSize },
    (_, i) => i + 1
  ).shuffle();

  /**
   * NOTE:
   * 현 스코프의 postSeq는 breadcrumbs의 root를 의미합니다.
   * 하지만, mysql2 패키지를 통해 pk를 0으로 넣을 수 없었습니다.
   * 따라서, mysql int 타입의 max 값을 root로 설정하였습니다.
   */
  const postSeq = 2_147_483_647;
  const breadcrumbs = new Map();
  breadcrumbs.set(postSeq, new Map());

  const promises = makeBreadcrumbs({
    lv: 1,
    maxLv,
    visited: new Set(),
    promises: [makePromise({ postSeq, parentSeq: null, repository })],
    repository,
    siblingSizes,
    breadcrumbs: breadcrumbs.get(postSeq),
    parentSeq: postSeq,
  });

  logger.info(
    `생성된 breadcrumbs는 다음과 같습니다.
    ${util.inspect(breadcrumbs, {
      depth: maxLv,
    })}`
  );

  return Promise.allSettled(promises);
}

(function () {
  const maxLv = 100;
  const maxSiblingSize = 5;

  insertBreadcrumbs(maxLv, maxSiblingSize)
    .then((values) =>
      logger.info(`게시글 ${values.length}개를 삽입하였습니다.`)
    )
    .catch((err) => logger.error(err.message))
    .finally(() => database.close());
})();
