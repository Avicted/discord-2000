import { Sequelize } from "sequelize"
const postgresDb: string | undefined = process.env.postgres_db
const postgresUser: string | undefined = process.env.postgres_user
const postgresPassword: string | undefined = process.env.postgres_password
const postgresHost: string | undefined = process.env.postgres_host


export class DatabaseContext {
    private connection: any = undefined

    public async initialize(): Promise<void> {
        // Check the .env variables needed for the database connection
        if (postgresDb === undefined) {
            console.error(`DatabaseContext: The mysql_database was undefined in the .env file`)
            process.exit(1)
        }
        else if (postgresUser === undefined) {
            console.error(`DatabaseContext: The mysql_user was undefined in the .env file`)
            process.exit(1)
        }
        else if (postgresPassword === undefined) {
            console.error(`DatabaseContext: The mysql_password was undefined in the .env file`)
            process.exit(1)
        }
        else if (postgresHost === undefined) {
            console.error(`DatabaseContext: The postgres_host was undefined in the .env file`)
            process.exit(1)
        }

        // Create a new database connection
        this.connection = new Sequelize(postgresDb, postgresUser, postgresPassword, {
            port: 5432,
            host: postgresHost,
            dialect: 'postgres',
            dialectOptions: {}
        })

        // Test if the database connection was successful?
        try {
            await this.connection.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('DatabaseContext: Unable to connect to the database:', error);
            process.exit(1)
        }
    }
}