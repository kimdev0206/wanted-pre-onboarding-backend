const { faker } = require("@faker-js/faker");

require("dotenv").config();
const database = require("./database");
const makeUserRepository = require("../repositories/post-repository");
const logger = require("../utils/logger");

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
  return +(lv + "" + seq);
}

function* makeSiblingSizeGenerator(size) {
  while (true) {
    for (let i = size; i >= 1; i--) {
      yield i;
    }
  }
}

function makeBreadcrumbs({
  lv,
  maxLv,
  visited,
  promises,
  repository,
  getSiblingSize,
  parentSeq,
}) {
  if (lv === maxLv) return;

  const siblingSize = getSiblingSize.next().value;

  for (let i = 1; i <= siblingSize; i++) {
    const postSeq = makePostSeq(lv, i);

    if (!visited.has(postSeq)) {
      visited.add(postSeq);
      promises.push(makePromise({ postSeq, parentSeq, repository }));

      makeBreadcrumbs({
        lv: lv + 1,
        maxLv,
        visited,
        promises,
        repository,
        getSiblingSize,
        parentSeq: postSeq,
      });
    }
  }

  return promises;
}

function insertBreadcrumbs(maxLv, maxSiblingSize) {
  const repository = makeUserRepository(database);
  const getSiblingSize = makeSiblingSizeGenerator(maxSiblingSize);

  const postSeq = 1;
  const promises = makeBreadcrumbs({
    lv: 1,
    maxLv,
    visited: new Set(),
    promises: [makePromise({ postSeq, parentSeq: null, repository })],
    repository,
    getSiblingSize,
    parentSeq: postSeq,
  });

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
