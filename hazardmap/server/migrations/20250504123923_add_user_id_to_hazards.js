exports.up = function (knex) {
    return knex.schema.table('hazards', (table) => {
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table('hazards', (table) => {
      table.dropColumn('user_id');
    });
  };