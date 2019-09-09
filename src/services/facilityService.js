import db from '../models';
import { Helpers } from '../utils';

const {
  Facility, sequelize, RoomCategory, Room, AmenityFacility, Amenity
} = db;
const { updateCollection } = Helpers;

/**
 * A collection of methods that handles the database interactions
 * for managing a Facility as an entity of the App.
 *
 * @class FacilityService
 */
class FacilityService {
  /**
   * Checks the room category value and creates a new record for any category added
   * by user.
   * @static
   * @param {array} rooms - An array of rooms of a specific facility.
   * @returns {Promise<Array>} A promise object with updated room properties.
   * @memberof FacilityService
   */
  static async sortRoomCategory(rooms) {
    const updatedRooms = rooms.map(async (room) => {
      const { dataValues: { label } } = await RoomCategory.findByPk(room.roomCategoryId);
      if (label === 'Others') {
        const { id } = await RoomCategory.create({ description: ' ', label: room.newCategory });
        room.roomCategoryId = id;
      }
      return room;
    });
    return Promise.all(updatedRooms);
  }

  /**
   * Creates an array of amenities for a specific facility.
   * @static
   * @param {object} amenities - Facility data to be recorded in the database.
   * @param {number} id - Facility id.
   * @returns {array}  An array of facility amenities.
   * @memberof FacilityService
   */
  static sortFacilityAmenities(amenities, id) {
    return amenities ? amenities.map((item) => ({ amenityId: item, facilityId: id })) : [];
  }

  /**
   * Fetches a facility instance based on it's primary key.
   * @static
   * @param {integer} facilityId - Primary key of the facility to be fetched.
   * @param {object} options - Additional query information
   * @returns {Promise<array>}  An instance of Facility table including it's relationships.
   * @memberof FacilityService
   */
  static async findFacilityById(facilityId, options = {}) {
    return Facility.findByPk(facilityId, options);
  }


  /**
   * Creates a facility record in the database.
   * @static
   * @param {object} facilityInfo - Facility data to be recorded in the database.
   * @returns {Promise<object>} A promise object with facility detail.
   * @memberof FacilityService
   */
  static async createFacility(facilityInfo) {
    const { amenities } = facilityInfo;
    try {
      const rooms = await FacilityService.sortRoomCategory(facilityInfo.rooms);
      const result = await sequelize.transaction(async (t) => {
        const { id: facilityId } = await Facility.create(facilityInfo, { transaction: t });
        const updatedRooms = await updateCollection(rooms, { facilityId });
        const facilityAmenities = FacilityService.sortFacilityAmenities(amenities, facilityId);
        await AmenityFacility.bulkCreate(facilityAmenities, { transaction: t });
        await Room.bulkCreate(updatedRooms, { transaction: t });
        const options = { include: [{ model: Room, as: 'rooms' }, { model: Amenity, as: 'amenities' }], transaction: t };
        const facility = await FacilityService.findFacilityById(facilityId, options);
        return facility;
      });
      return result;
    } catch (err) {
      throw new Error('Failed to create facility. Try again');
    }
  }
}

export default FacilityService;
