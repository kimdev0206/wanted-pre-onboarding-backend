const express = require("express");
const { queryParser } = require("express-query-parser");

const queryParserOption = {
  parseNull: true,
  parseUndefined: true,
  parseBoolean: true,
  parseNumber: true,
};
const urlEncodedOption = { extended: false };

module.exports = Object.freeze({
  queryParser: queryParser(queryParserOption),
  bodyParser: [express.urlencoded(urlEncodedOption), express.json()],
});
