import fetch from "node-fetch";

const sleep = (): Promise<void> => new Promise((resolve) => {
    setTimeout(() => {
        resolve();
    }, 350);
})

interface CaptchaValidationResponse {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    'error-codes'?: string[];
}

export default async function handler(req: any, res: any) {
    const { body, method } = req;
    const { captcha } = body;

    if (method === 'POST') {
        if (!captcha) {
            return res.status(422).json({
                message: "Captcha verification required.",
            });
        }
        try {
            const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
                },
                method: "POST"
            });
            const data: unknown = await response.json();
            const captchaValidation = data as CaptchaValidationResponse;
            if (captchaValidation.success) {
                await sleep();
                return res.status(200).send("OK");
            }
            return res.status(422).json({
                message: "Invalid Captcha Code",
            });
        } catch (error) {
            console.error(error);
            return res.status(422).json({ message: "Something Went Wrong" });
        }
    }
    return res.status(404).send("Not Found");
}
