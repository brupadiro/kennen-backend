const path = require('path');
const fs = require('fs');

module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: 'db-postgresql-nyc1-64675-do-user-12753330-0.b.db.ondigitalocean.com',
      port: '25060',
      database: 'kennen',
      user: 'doadmin',
      password: 'AVNS_YFfHjZAV9pUg5xsgaTU',
      ssl: {
        ca: fs.readFileSync(`./config/ca-certificate.crt`).toString(),
      },
},
    useNullAsDefault: true,
  },
});
