import { NextFunction, Request, Response } from "express";
import { loginUser } from "../services/auth.service";
import { loginSchema } from "../validators/auth.schemas";
import { z } from "zod";


export async function login(req: Request, res: Response, next: NextFunction): Promise<void>{

    try{
        const validation = loginSchema.safeParse(req.body);
        if(!validation.success){
            res.status(400).json({message: "Invalid Input zod", errors: z.flattenError(validation.error).fieldErrors});
            return;
        }
        
        const user = await loginUser(validation.data.email, validation.data.password);
        if(!user){
            res.status(401).json({message: "Invalid email or password"});
            return;
        }
        res.status(200).json({message: "Login successful", user});

    }
    catch(err){
        next(err);
    }
};



