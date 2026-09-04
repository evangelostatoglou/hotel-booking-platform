import { NextFunction, Request, Response } from "express";
import { s_loginUser, s_registerUser } from "../services/auth.service";
import { loginSchema, registerSchema } from "../validators/auth.schemas";
import { z } from "zod";
import { createJWT } from "../utils/jwt";
import { NewUser } from "../repositories/user.repository";


export async function c_login(req: Request, res: Response, next: NextFunction): Promise<void>{

    try{
        //first we validate the input. if error we return 400 and the reason for the error i.e. pass must contain at least 1 capital letter
        const validation = loginSchema.safeParse(req.body);
        if(!validation.success){
            res.status(400).json({message: "Invalid Input zod", errors: z.flattenError(validation.error).fieldErrors});
            return;
        }

        //we now attempt to login the user. if user or password are wrong we return the below log with a 401 as bad input
        const user = await s_loginUser(validation.data.email, validation.data.password);
        //user now have {email: string, id: number, role: string | null} as data if OK
        if(!user){
            res.status(401).json({message: "Invalid email or password"});
            return;
        }
        // console.log("---controller");
        // console.log(user);
        
        // we now generate the JWT
        const token = createJWT(user);

        res.cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                sameSite: "lax",
                maxAge: 60 * 60 * 1000
            });

        res.status(200).json({message: "Login successful", user});

    }
    catch(err){
        next(err);
    }
};

export function c_logout(req: Request, res: Response, next: NextFunction): void{

    res.clearCookie("access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });
    
    res.status(200).json({message: "Logout OK"});
};







export function c_getCurrentUser(req: Request, res: Response, next: NextFunction): void{
    res.status(200).json({user: res.locals.auth});
};







export async function c_registerUser(req: Request, res: Response, next: NextFunction): Promise<void>{
    
    const validation = registerSchema.safeParse(req.body);
    if(!validation.success){
        res.status(400).json({message: "Invalid Reg Input zod", errors: z.flattenError(validation.error).fieldErrors});
        return;
    }

    const user = await s_registerUser(validation.data);
    if(!user){
        res.status(409).json({message: "E-mail is already registered"});
        return;
    }

    const token = createJWT(user);

        res.cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                sameSite: "lax",
                maxAge: 60 * 60 * 1000,
                path: "/"
            });

        res.status(201).json({message: "Login successful",
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
        }});
        
}



