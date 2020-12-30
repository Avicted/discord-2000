module.exports = {
    type: 'postgres',
    host: process.env.postgres_host,
    port: 5432,
    username: process.env.postgres_user,
    password: process.env.postgres_password,
    database: process.env.postgres_db,
    synchronize: false,
    logging: false,
    entities: ['dist/entity/**/*.js'],
    migrations: ['dist/migration/**/*.js'],
    subscribers: ['dist/subscriber/**/*.js'],
    cli: {
        entitiesDir: ['src/entity'],
        migrationsDir: ['src/migration'],
        subscribersDir: ['src/subscriber'],
    },
}
