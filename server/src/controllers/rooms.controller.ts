import { NextFunction, Request, Response } from "express";
import { s_getAllRoomTypes, s_getRoomType } from "../services/rooms.service";



export async function c_getAllRoomTypes(req: Request, res: Response, next: NextFunction):Promise<void>{
    const result = await s_getAllRoomTypes();
    res.status(200).json({result});
    return;
}

export async function c_getRoomType(req: Request, res: Response, next: NextFunction):Promise<void>{
    const tempslug = req.params.slug
    if(typeof tempslug !== "string"){
        res.status(400).json({message: "Invalid room type"});
        return;
    }
    const slug = tempslug.trim().toLowerCase();
    const result = await s_getRoomType(slug);

    if(!result){
        res.status(404).json({message: "Room type not found"});
        return;
    }

    res.status(200).json({result});
    return;
}

