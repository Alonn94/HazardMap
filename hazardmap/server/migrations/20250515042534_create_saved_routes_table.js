exports.up = function(knex) {
    return knex.schema.createTable('saved_routes', (table) => {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('start_address').notNullable();
      table.string('end_address').notNullable();
      table.json('start_coords').notNullable();
      table.json('end_coords').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('saved_routes');
  };