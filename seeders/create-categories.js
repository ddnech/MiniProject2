'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      { name: 'General' },
      { name: 'Sports' },
      { name: 'Economy' },
      { name: 'Politics' },
      { name: 'Business' },
      { name: 'Fiction' },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
