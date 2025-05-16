exports.up = function (knex) {
    return knex.schema.table('hazards', (table) => {
      table.integer('upvotes').defaultTo(0);
      table.integer('downvotes').defaultTo(0);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table('hazards', (table) => {
      table.dropColumn('upvotes');
      table.dropColumn('downvotes');
    });
  };


  