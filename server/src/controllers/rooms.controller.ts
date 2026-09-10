import { Request, Response } from "express";
import { getAllRoomTypes as getAllRoomTypesService, getRoomType as getRoomTypeService } from "../services/rooms.service";



export async function getAllRoomTypes(req: Request, res: Response):Promise<void>{
    const result = await getAllRoomTypesService();
    res.status(200).json({result});
    return;
}

export async function getRoomType(req: Request, res: Response):Promise<void>{
    const tempslug = req.params.slug
    if(typeof tempslug !== "string"){
        res.status(400).json({message: "Invalid room type"});
        return;
    }
    const slug = tempslug.trim().toLowerCase();
    const result = await getRoomTypeService(slug);

    if(!result){
        res.status(404).json({message: "Room type not found"});
        return;
    }

    res.status(200).json({result});
    return;
}

