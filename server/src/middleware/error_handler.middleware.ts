import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors";


export function errorHandler(err:unknown, req: Request, res: Response, next: NextFunction):void{
    if(res.headersSent){
        next(err);
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ code: err.code, message: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({message: "Internal server error"});
}



