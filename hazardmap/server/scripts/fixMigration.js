// scripts/fixMigration.js

const knex = require('../db/db'); // Adjust the path if your db config is elsewhere

knex('knex_migrations')
  .where({ name: '20250513091342_update_vote_columns_in_hazards.js' })
  .del()
  .then(() => {
    console.log('✅ Corrupt migration removed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });