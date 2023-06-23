'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const date = new Date();
 
     const likedBlogs = [
      {
        blog_id: 7,
        user_id: 1,
        createdAt: date,
        updatedAt: date,
      },
      {
        blog_id: 7,
        user_id: 2,
        createdAt: date,
        updatedAt: date,
      },
      {
        blog_id: 7,
        user_id: 3,
        createdAt: date,
        updatedAt: date,
      },
      {
        blog_id: 8,
        user_id: 1,
        createdAt: date,
        updatedAt: date,
      },
      {
        blog_id: 8,
        user_id: 2,
        createdAt: date,
        updatedAt: date,
      },
      {
        blog_id: 9,
        user_id: 1,
        createdAt: date,
        updatedAt: date,
      },
    ];
    await queryInterface.bulkInsert("Liked_blogs", likedBlogs);
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Liked_blogs", null, {});
  }
};
