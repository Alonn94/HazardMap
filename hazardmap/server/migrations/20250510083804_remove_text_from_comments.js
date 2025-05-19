exports.up = function(knex) {
    return knex.schema.table('comments', function(table) {
      table.dropColumn('text');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('comments', function(table) {
      table.text('text').notNullable(); 
    });
  };