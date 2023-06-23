'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const date = new Date();

    await queryInterface.bulkInsert("Blogs", [
      {
        author_id: 1,
        linkUrl: "https://www.youtube.com/",
        title: "Sample Blog 1",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        keywords: "sample",
        category_id: 1,
        country:"Meowland",
        createdAt: date,
        updatedAt: date,
      },
      {
        author_id: 1,
        imgBlog: "/public/IMG-2.jpeg",
        title: "Sample Blog 2",
        content: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        keywords: "sample",
        category_id: 2,
        createdAt: date,
        updatedAt: date,
      },
      {
        author_id: 2,
        imgBlog: "/public/IMG-3.jpeg",
        title: "Sample Blog 3",
        content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
        keywords: "sample",
        category_id: 2,
        createdAt: date,
        updatedAt: date,
      },
      {
        author_id: 1,
        imgBlog: "/public/IMG-4.jpeg",
        title: "Sample Blog 4",
        content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        category_id: 2,
        createdAt: date,
        updatedAt: date,
      },
      {
        author_id: 2, 
        imgBlog: "/public/IMG-5.jpeg",
        title: "Sample Blog 5",
        content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        keywords: "sample",
        category_id: 1, 
        createdAt: date,
        updatedAt: date,
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Blogs", null, {});
  }
};
