module.exports = {
    type: 'postgres',
    host: process.env.postgres_host,
    port: 5432,
    username: process.env.postgres_user,
    password: process.env.postgres_password,
    database: process.env.postgres_db,
    synchronize: false,
    logging: false,
    entities: ['dist/persistence/entity/**/*.js'],
    migrations: ['dist/persistence/migration/**/*.js'],
    subscribers: ['dist/persistence/subscriber/**/*.js'],
    cli: {
        entitiesDir: ['src/persistence/entity'],
        migrationsDir: ['src/persistence/migration'],
        subscribersDir: ['src/persistence/subscriber'],
    },
}
