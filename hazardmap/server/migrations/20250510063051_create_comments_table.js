exports.up = function(knex) {
    return knex.schema.createTable('comments', function(table) {
      table.increments('id').primary();
      table.integer('hazard_id').unsigned().notNullable()
           .references('id').inTable('hazards').onDelete('CASCADE');
      table.integer('user_id').unsigned().notNullable()
           .references('id').inTable('users').onDelete('CASCADE');
      table.text('content').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('comments');
  };