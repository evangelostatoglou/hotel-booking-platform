import { db_getAllRoomTypes, db_getRoomType } from "../repositories/rooms.repository";

export async function s_getAllRoomTypes(){
    return await db_getAllRoomTypes();
}


export async function s_getRoomType(slug: string){
    return await db_getRoomType(slug);
}


