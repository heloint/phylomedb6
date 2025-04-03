export default function LoginEmail(token: string) {
    const loginLink = `${process.env.NEXT_PUBLIC_BASE_URL}/login?login_token=${token}`;

    return `
                <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Welcome Email</title>
                <style>
                .login-button {
                    padding: 10px;
                    background-color: rgb(249, 250, 251);
                    color: rgb(17, 24, 39);
     
                    border-radius: 5px;
                    border: 2px solid rgb(51, 65, 85);
                    transition: background-color 0.3s, border-color 0.3s,
                    backdrop-filter 0.3s;
                    display: inline-block;
                    text-align: center;
                    backdrop-filter: blur(5px);
                }

                .login-button:hover {
                    background-color: white;
                    backdrop-filter: blur(5px) opacity(0.6);
                    border-style: solid;
                    border-color: rgb(51, 65, 85);
                }

                p,
                h2 {
                    color: rgb(17, 24, 39);
                }
                footer {
                    margin-top: 20px;
                }

                .notification {
                    text-decoration: underline;
                }
                </style>
            </head>
            <body>
                <h2>Welcome to PhylomeDB6!</h2>
                <p>Please click the link below to log in:</p>
                <a href="${loginLink}" class="login-button"> Login to PhylomeDB6 </a>

                <p class="notification">The link is valid for 15 minutes only.</p>

                <p>If you did not request this email, please ignore it.</p>

                <footer>
                <p>Best regards,</p>
                <p>The PhylomeDB6 Team</p>
                </footer>
            </body>
            </html>

    `;
}
