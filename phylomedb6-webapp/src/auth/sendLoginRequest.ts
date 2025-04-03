"use server";

import nodemailer from "nodemailer";
import LoginEmail from "../components/loginEmail/loginEmail";
import { v4 } from "uuid";
import { insertLoginData } from "./models/sent_login_tokens";
import { LoginAndSessionOptions } from "./models/sent_login_tokens";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendLoginEmail(params: LoginAndSessionOptions) {
    const content = {
        from: process.env.EMAIL_USER,
        to: params.email,
        subject: "Welcome to the PhylomeDB6",
        html: LoginEmail(params.token),
    };
    try {
        await transporter.sendMail(content);
        return {
            error: false,
            message: `Login link has been sent successfully to "${params.email}"! `,
        };
    } catch (err) {
        return { error: true, message: "Error has occured during process." };
    }
}

async function insertLoginRequest(params: LoginAndSessionOptions) {
    try {
        const result_insert_login_request = await insertLoginData(params);
        return {
            error: false,
            message: "Login request was processed successfully",
        };
    } catch (err) {
        return { error: true, message: "Error has occured during process." };
    }
}

export async function handleLoginRequest(verifiedEmail: string) {
    const tokenGererated = v4();

    const loginRequestOptions: LoginAndSessionOptions = {
        email: verifiedEmail,
        token: tokenGererated,
    };
    const resultInsertLoginRequest =
        await insertLoginRequest(loginRequestOptions);

    if (!resultInsertLoginRequest.error) {
        return await sendLoginEmail(loginRequestOptions);
    }
    return resultInsertLoginRequest;
}
