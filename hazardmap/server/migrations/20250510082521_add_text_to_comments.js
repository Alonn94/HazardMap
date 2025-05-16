exports.up = function(knex) {
    return knex.schema.alterTable('comments', (table) => {
      table.text('text').notNullable();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable('comments', (table) => {
      table.dropColumn('text');
    });
  };