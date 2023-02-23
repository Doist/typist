/**
 * A common regex for all line termination conventions.
 */
const REGEX_LINE_BREAKS = /(?:\r\n|\r|\n)/g

/**
 * A regex for standard punctuation characters for US-ASCII plus unicode punctuation.
 *
 * @see https://stackoverflow.com/a/25575009
 */
const REGEX_PUNCTUATION = /[\u2000-\u206f\u2e00-\u2e7f'!"#$%&()*+,\-./:;<=>?@\\[\]^_`{|}~]/

export { REGEX_LINE_BREAKS, REGEX_PUNCTUATION }
