import { helpers, ApiError } from '../utils';
import db from '../models';

const { hashPassword } = helpers;
const { User } = db;

/**
 * UserService class, interface for UserModel
 */
export default class UserService {
  /**
   * Saves user in the database
   * @static
   * @param {object} user - The user to be saved in the database.
   * @returns {Promise<object>} A promise object with user detail.
   * @memberof UserService
   */
  static async create(user) {
    user.password = hashPassword(user.password);
    const { dataValues: newUser } = await User.create(user);
    return newUser;
  }

  /**
   *
   * updates an existing user by ID
   * @static
   * @param {object} userData user properties to be updated
    * @param {string} id user id
   * @returns {Promise<object | null | string> } an object containing the updated
   * properties of the user is returned on success
   * or a null value if update fails, and an error message if a user is not found
   * @memberof UserService
   */
  static async updateById(userData, id) {
    const [rowaffected, [user]] = await User.update(userData, { returning: true, where: { id } });
    if (!rowaffected) throw new Error('Not Found');
    return user;
  }

  /**
   * Finds user in the database
   *
   * @param {object} email - The user email
   * @returns {Promise<object>} A promise object with user detail if user exists.
   */
  static async find(email) {
    return User.findOne({ where: { email } });
  }

  /**
   * Update user password in the database
   *
   * @param {string} password - New user password to be updated in database
   * @param {string} email - The user email for identification in database
   * @returns {Promise<object>} A promise object with user detail.
   */
  static async updatePassword(password, email) {
    const hashedPassword = hashPassword(password);
    const result = await User.update({ password: hashedPassword },
      { where: { email }, returning: true });
    return result;
  }

  /**
   * signin with users google or facebook data
   *
   * @static
   * @param {object} userData - user data
   * @memberof UserService
   * @returns {object} - the user data object
   *
   */
  static async socialLogin(userData) {
    try {
      const existingUser = await db.User.findOne({
        where: {
          email: userData.emails[0].value
        }
      });
      if (!existingUser) {
        throw new ApiError(403, 'You need to signup to use this feature');
      }
      return existingUser.dataValues;
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  }

  /**
 * @description Sign-in existing user
 * @param {object} email user's registered email
 * @returns {Promise<object>} A promise object with user detail.
 */
  static userLogin(email) {
    return User.findOne({
      where: { email }
    });
  }
}
