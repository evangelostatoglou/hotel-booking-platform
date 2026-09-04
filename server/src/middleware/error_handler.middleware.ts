import type { ErrorRequestHandler } from "express";
import { NextFunction, Request, Response } from "express";


export function errorHandler(err:unknown, req: Request, res: Response, next: NextFunction):void{
    console.log(err);

    if(res.headersSent){
        next(err);
        return;
    }
    res.status(500).json({message: "Internal server error"});
}



