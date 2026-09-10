import { getAllRoomTypes as getAllRoomTypeRecords, getRoomType as getRoomTypeRecord } from "../repositories/rooms.repository";

export async function getAllRoomTypes(){
    return await getAllRoomTypeRecords();
}


export async function getRoomType(slug: string){
    return await getRoomTypeRecord(slug);
}


