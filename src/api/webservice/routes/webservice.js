'use strict';

/**
 * webservice router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::webservice.webservice');
