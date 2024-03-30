/**
 * A common regular expression for all line termination conventions.
 */
const REGEX_LINE_BREAKS = /(?:\r\n|\r|\n)/g

/**
 * A regular expression for standard punctuation characters for US-ASCII plus unicode punctuation.
 *
 * @see https://stackoverflow.com/a/25575009
 */
const REGEX_PUNCTUATION = /[\u2000-\u206f\u2e00-\u2e7f'!"#$%&()*+,\-./:;<=>?@\\[\]^_`{|}~]/

/**
 * The perfect URL validation regular expression for Web URLs.
 *
 * @see https://mathiasbynens.be/demo/url-regex
 */
const REGEX_WEB_URL =
    /(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?/i

export { REGEX_LINE_BREAKS, REGEX_PUNCTUATION, REGEX_WEB_URL }
