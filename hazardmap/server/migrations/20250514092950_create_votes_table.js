
exports.up = function(knex) {
    return knex.schema.createTable('votes', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.integer('hazard_id').unsigned().notNullable();
      table.enu('type', ['relevant', 'not_relevant']).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
  
      table.unique(['user_id', 'hazard_id']);
  
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('hazard_id').references('id').inTable('hazards').onDelete('CASCADE');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('votes');
  };