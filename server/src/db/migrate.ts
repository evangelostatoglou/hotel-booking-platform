import { appPool } from "../config/database";
import { StartupMode } from "../server";


export async function runMigrations(): Promise<void> {

    const client = await appPool.connect();

    try {
        await client.query("BEGIN");
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                first_name VARCHAR(25) NOT NULL,
                last_name VARCHAR(25) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                phone varchar(13),
                created_at TIMESTAMP,
                role char(1)
            );
            `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                check_in DATE,
                check_out DATE,
                adults INT,
                children INT,
                status VARCHAR(20),
                price MONEY,
                created_at TIMESTAMP,
                special_request VARCHAR(400)
            );
            `);

            await client.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
                amount MONEY,
                method VARCHAR(20),
                status VARCHAR(20),
                reference VARCHAR(20),
                created_at TIMESTAMP
            );
            `);

            await client.query(`
            CREATE TABLE IF NOT EXISTS room_types (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR(40) UNIQUE,
                description VARCHAR(1000),
                capacity_adults INTEGER,
                capacity_children INTEGER,
                price MONEY,
                bed_type VARCHAR(30),
                size_m2 INTEGER
            );
            `);

            await client.query(`
            CREATE TABLE IF NOT EXISTS rooms (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                room_type_id INTEGER NOT NULL REFERENCES room_types(id),
                room_number VARCHAR(3) UNIQUE NOT NULL,
                status VARCHAR(20)
            );
            `);

            await client.query(`
            CREATE TABLE IF NOT EXISTS bookings_rooms (
                bookings_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
                rooms_id INTEGER NOT NULL REFERENCES rooms(id),
                PRIMARY KEY (bookings_id, rooms_id)
            );
            `);
            
            await client.query(`
            CREATE TABLE IF NOT EXISTS amenities (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR(20),
                description VARCHAR(150)
            );
            `);

            await client.query(`
            CREATE TABLE IF NOT EXISTS room_types_amenities (
                room_types_id INTEGER NOT NULL REFERENCES room_types(id),
                amenities_id INTEGER NOT NULL REFERENCES amenities(id),
                PRIMARY KEY (room_types_id, amenities_id)
            );
            `);
            await client.query(`
            CREATE TABLE IF NOT EXISTS room_type_images (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                room_type_id INTEGER NOT NULL
                REFERENCES room_types(id)
                ON DELETE CASCADE,
                image_url TEXT NOT NULL,
                alt_text VARCHAR(150),
                sort_order INTEGER NOT NULL DEFAULT 0
            );
            `);
            
            await client.query("COMMIT");
    } catch {
        await client.query("ROLLBACK");
    } finally {
        client.release();
    }
}
