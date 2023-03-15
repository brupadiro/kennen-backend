'use strict';

/**
 * webservice controller
 */

const {
  createCoreController
} = require('@strapi/strapi').factories;
module.exports = createCoreController('api::webservice.webservice');
