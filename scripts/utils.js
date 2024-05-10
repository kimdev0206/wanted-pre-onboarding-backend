const { faker } = require("@faker-js/faker");

module.exports = {
  makePostHasClosurePromise: makePostHasClosurePromise(),
  makePostPromise: makePostPromise(),
  makePostSeq,
  makePostSeqSibling,
};

function makePostHasClosurePromise() {
  const PostRepository = require("../src/repositories/post.repository");
  const repository = new PostRepository();

  return function (params) {
    return repository.insertPostHasClosure(params);
  };
}

function makePostPromise() {
  const PostRepository = require("../src/repositories/post.repository");
  const repository = new PostRepository();

  return function ({
    postSeq,
    userSeq,
    title = faker.person.jobTitle(),
    content = faker.lorem.text(),
  }) {
    const params = {
      postSeq,
      userSeq,
      title,
      content,
    };
    return repository.insertPostWithPK(params);
  };
}

function makePostSeq({ lv, seq }) {
  const str = lv + "" + seq;
  return Number(str);
}

function makePostSeqSibling({ lv, prevLv, seq, maxSiblingSize }) {
  const maxStrSeq = String(maxSiblingSize).length;
  const strSeq = String(seq).padStart(maxStrSeq, "0");
  const str = lv + "" + prevLv + strSeq;

  return Number(str);
}
