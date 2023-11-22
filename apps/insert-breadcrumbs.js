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

function makeBreadcrumbs({ lv, maxLv, promises, repository, parentSeq }) {
  if (lv === maxLv) return;

  const postSeq = makePostSeq(lv, lv - 1);
  promises.push(makePromise({ postSeq, parentSeq, repository }));

  makeBreadcrumbs({
    lv: lv + 1,
    maxLv,
    promises,
    repository,
    parentSeq: postSeq,
  });

  return promises;
}

function insertBreadcrumbs(maxLv) {
  const repository = makeUserRepository(database);
  const postSeq = 1;
  const lv = 0;

  const promises = makeBreadcrumbs({
    lv: lv + 1,
    maxLv,
    promises: [makePromise({ postSeq, parentSeq: null, repository })],
    repository,
    parentSeq: postSeq,
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
