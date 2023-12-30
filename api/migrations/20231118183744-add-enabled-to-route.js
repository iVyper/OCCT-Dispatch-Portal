'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log(
        'Running migration: Adding "enabled" column to "routes" table'
      );

      await queryInterface.addColumn('routes', 'enabled', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });

      console.log(
        'Migration successful: Added "enabled" column to "routes" table'
      );
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log(
        'Running migration: Removing "enabled" column from "routes" table'
      );

      await queryInterface.removeColumn('routes', 'enabled');

      console.log(
        'Migration successful: Removed "enabled" column from "routes" table'
      );
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },
};
