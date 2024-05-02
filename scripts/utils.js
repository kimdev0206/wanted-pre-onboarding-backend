const { faker } = require("@faker-js/faker");

module.exports = {
  makePostPromise: makePostPromise(),
  makePostSeq,
  makePostSeqSibling,
};

function makePostPromise() {
  const PostRepository = require("../src/repositories/post.repository");
  const repository = new PostRepository();

  return function ({
    postSeq,
    superSeq,
    userSeq,
    title = faker.person.jobTitle(),
    content = faker.lorem.text(),
  }) {
    const params = {
      postSeq,
      superSeq,
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
