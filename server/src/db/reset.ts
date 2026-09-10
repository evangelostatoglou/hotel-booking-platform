import { appPool } from "../config/database";
import { StartupMode } from "../server";



export async function resetDb(): Promise<void>{
    const client = await appPool.connect();
    try{
        await client.query("BEGIN");

        await client.query(`
            TRUNCATE TABLE
                bookings,
                payments,
                users,
                rooms,
                room_types,
                room_type_images
                RESTART IDENTITY
                CASCADE;
            `);

        await client.query("COMMIT");

    } catch(error){
        await client.query("ROLLBACK");
        throw error;
    } finally{
        client.release();
    }
}
