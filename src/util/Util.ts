/**
 * Contains various general-purpose utility methods
 */
class Util {
  /**
   * Checks if something is a promise
   * @param val The value to be checked
   * @returns If the value is a promise
   */
  static isPromise(val: Promise<any> | any) {
    return val && Object.prototype.toString.call(val) === '[object Promise]' && typeof val.then === 'function';
  }

  /**
   * Slices strings to meet certain length limits
   * @param str The string to be sliced
   * @param minLength The minimum length of the string
   * @param maxLength The maximum length of the string
   * @returns The sliced string
   */
  static sliceString(str: string, minLength = 0, maxLength = 1024) {
    return str.slice(minLength, maxLength - 3) + (str.length > maxLength - 3 ? '...' : '');
  }

  /**
   * Makes the provided string a code block
   * @param str The string to be transformed
   * @param lang The language of the code block
   * @param minLength The minimum length of the string
   * @param maxLength The maximum length of the string
   * @returns The string in a code block.
   */
  static code(str: string, lang: string, minLength = 0, maxLength = 1024) {
    return `\`\`\`${lang}\n${Util.sliceString(str, minLength, maxLength)}\n\`\`\``;
  }
}

export default Util;
