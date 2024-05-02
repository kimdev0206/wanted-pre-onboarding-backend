module.exports = function (req, _, next) {
  let log = [`${req.method} on ${req.url}`];

  switch (req.method) {
    case "POST":
      Object.keys(req.body).length &&
        log.push(`with ${JSON.stringify(req.body)}`);
      break;

    case "PUT":
      Object.keys(req.body).length &&
        log.push(`with ${JSON.stringify(req.body)}`);
      break;
  }

  console.log(log.join(" "));

  next();
};
