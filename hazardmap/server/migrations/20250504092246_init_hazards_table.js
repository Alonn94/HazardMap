exports.up = function (knex) {
    return knex.schema.createTable('hazards', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.float('latitude').notNullable();
      table.float('longitude').notNullable();
      table.text('description');
      table.string('type');
      table.string('severity');
      table.string('image');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('hazards');
  };