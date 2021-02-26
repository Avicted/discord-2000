module.exports = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
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
