const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { sendEmail, emailTemplates } = require("../utils/email");
const { sendSuccess, sendCreated } = require("../utils/apiResponse");

// ─── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, phone, role, timezone } = req.body;

        // Check duplicate
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) throw new AppError("Email already in use.", 409);

        // Hash password (10 rounds = good balance of security & speed)
        const passwordHash = await bcrypt.hash(password, 10);

        // Email verification token
        const emailVerifyToken = crypto.randomBytes(32).toString("hex");

        // Create user + profile with timezone
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName: lastName || "",
                phone,
                role: role || "PATIENT",
                emailVerifyToken,
                profile: { create: { timezone: timezone || "UTC" } },
            },
            select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
        });

        // Create streak and send email (non-blocking, fire and forget)
        Promise.all([
            prisma.streak.create({ data: { userId: user.id } }).catch(() => { }),
            (async () => {
                // Use backend URL for verification (returns HTML with redirect)
                let backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
                // Remove trailing slash if present
                backendUrl = backendUrl.replace(/\/$/, '');
                const verifyLink = `${backendUrl}/api/v1/auth/verify-email/${emailVerifyToken}`;
                const { subject, html } = emailTemplates.verification(firstName, verifyLink);
                await sendEmail(email, subject, html).catch(() => { });
            })()
        ]);

        // Return verification link in response for testing (will be hidden in production UI)
        let backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        backendUrl = backendUrl.replace(/\/$/, '');
        const verifyLink = `${backendUrl}/api/v1/auth/verify-email/${emailVerifyToken}`;
        sendCreated(res, { user, verifyLink }, "Registration successful. Please verify your email.");
    } catch (err) {
        next(err);
    }
};

// ─── Verify Email ─────────────────────────────────────────────────────────────
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
        if (!user) {
            return res.send(`
                <html>
                    <head>
                        <title>Email Verification</title>
                        <style>
                            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f3f4f6; }
                            .container { text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                            h1 { color: #dc2626; margin: 0 0 10px 0; }
                            p { color: #4b5563; margin: 0 0 20px 0; }
                            a { display: inline-block; background: #2F5B8C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Verification Link Expired</h1>
                            <p>Sorry, this link has expired. Please try signing up again.</p>
                            <a href="${process.env.FRONTEND_URL || 'https://craftathon.vercel.app'}/signup">Back to Signup</a>
                        </div>
                    </body>
                </html>
            `);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true, emailVerifyToken: null },
        });

        // Send HTML redirect to login
        res.send(`
            <html>
                <head>
                    <title>Email Verified - Redirecting...</title>
                    <meta http-equiv="refresh" content="2;url=${process.env.FRONTEND_URL || 'https://craftathon.vercel.app'}/login">
                    <style>
                        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f3f4f6; }
                        .container { text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                        .success { color: #16a34a; font-size: 48px; margin: 0 0 20px 0; }
                        h1 { color: #1f2937; margin: 0 0 10px 0; }
                        p { color: #4b5563; margin: 0 0 20px 0; }
                        a { display: inline-block; background: #2F5B8C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success">✓</div>
                        <h1>You successfully verified your email!</h1>
                        <p>Redirecting to login in 2 seconds...</p>
                        <p>If not redirected, <a href="${process.env.FRONTEND_URL || 'https://craftathon.vercel.app'}/login">click here to continue</a></p>
                    </div>
                </body>
            </html>
        `);
    } catch (err) {
        next(err);
    }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new AppError("Invalid email or password.", 401);
        }
        if (!user.isActive) throw new AppError("Account deactivated. Contact support.", 403);
        if (!user.isEmailVerified) throw new AppError("Please verify your email first. Check your inbox for the verification link.", 403);

        const payload = { id: user.id, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Store refresh token (non-blocking)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } }).catch(() => { }); // fire and forget

        sendSuccess(res, {
            accessToken,
            refreshToken,
            user: {
                id: user.id, email: user.email, firstName: user.firstName,
                lastName: user.lastName, role: user.role, isEmailVerified: user.isEmailVerified,
            },
        }, "Login successful.");
    } catch (err) {
        next(err);
    }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) throw new AppError("Refresh token required.", 400);

        const decoded = verifyRefreshToken(token);

        const stored = await prisma.refreshToken.findUnique({ where: { token } });
        if (!stored || stored.expiresAt < new Date()) {
            throw new AppError("Invalid or expired refresh token.", 401);
        }

        // Rotate token
        await prisma.refreshToken.delete({ where: { token } });

        const payload = { id: decoded.id, role: decoded.role };
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await prisma.refreshToken.create({
            data: { token: newRefreshToken, userId: decoded.id, expiresAt },
        });

        sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, "Token refreshed.");
    } catch (err) {
        next(err);
    }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;
        if (token) {
            await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => { });
        }
        sendSuccess(res, {}, "Logged out successfully.");
    } catch (err) {
        next(err);
    }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        // Always return success to prevent email enumeration
        if (!user) return sendSuccess(res, {}, "If that email exists, a reset link has been sent.");

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });

        // Use backend URL for reset password (returns HTML form to reset)
        let backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        backendUrl = backendUrl.replace(/\/$/, '');
        const resetLink = `${backendUrl}/api/v1/auth/reset-password/${resetToken}`;
        const { subject, html } = emailTemplates.resetPassword(user.firstName, resetLink);
        await sendEmail(email, subject, html);

        sendSuccess(res, {}, "If that email exists, a reset link has been sent.");
    } catch (err) {
        next(err);
    }
};

// ─── Reset Password (GET - Show Form) ─────────────────────────────────────────
const resetPasswordForm = async (req, res, next) => {
    try {
        const { token } = req.params;

        // Verify token exists and not expired
        const user = await prisma.user.findFirst({
            where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
        });

        if (!user) {
            return res.send(`
                <html>
                    <head>
                        <title>Password Reset</title>
                        <style>
                            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f3f4f6; }
                            .container { text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 400px; }
                            h1 { color: #dc2626; margin: 0 0 10px 0; font-size: 24px; }
                            p { color: #4b5563; margin: 0 0 20px 0; }
                            a { display: inline-block; background: #2F5B8C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Reset Link Expired</h1>
                            <p>Sorry, this reset link has expired. Please request a new one.</p>
                            <a href="${process.env.FRONTEND_URL || 'https://craftathon.vercel.app'}/forgot-password">Request New Link</a>
                        </div>
                    </body>
                </html>
            `);
        }

        // Token is valid, show reset form
        res.send(`
            <html>
                <head>
                    <title>Reset Your Password</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; }
                        .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); max-width: 400px; width: 100%; }
                        h1 { color: #1f2937; margin-bottom: 10px; font-size: 28px; }
                        .subtitle { color: #6b7280; margin-bottom: 30px; font-size: 14px; }
                        .form-group { margin-bottom: 20px; }
                        label { display: block; color: #374151; font-weight: 600; margin-bottom: 8px; font-size: 14px; }
                        input { width: 100%; padding: 12px 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: all 0.3s; font-family: inherit; }
                        input:focus { outline: none; border-color: #2F5B8C; box-shadow: 0 0 0 3px rgba(47, 91, 140, 0.1); }
                        .password-wrapper { position: relative; }
                        .toggle-password { position: absolute; right: 12px; top: 38px; cursor: pointer; color: #6b7280; font-size: 18px; border: none; background: none; padding: 0; }
                        .error { color: #dc2626; font-size: 13px; margin-top: 5px; display: none; }
                        button { width: 100%; padding: 12px 14px; background: linear-gradient(135deg, #2F5B8C 0%, #3E6FA3 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.3s; margin-top: 10px; }
                        button:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(47, 91, 140, 0.3); }
                        button:active { transform: translateY(0); }
                        .info { background: #eff6ff; border-left: 4px solid #2F5B8C; padding: 12px 14px; border-radius: 6px; margin-bottom: 20px; color: #1e40af; font-size: 13px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Reset Password</h1>
                        <p class="subtitle">Enter your new password below</p>
                        
                        <div class="info">💡 Password must be at least 8 characters long</div>
                        
                        <form id="resetForm">
                            <div class="form-group">
                                <label for="password">New Password</label>
                                <div class="password-wrapper">
                                    <input type="password" id="password" name="password" required placeholder="Enter new password" minlength="8">
                                    <button type="button" class="toggle-password" onclick="togglePassword('password')">👁️</button>
                                </div>
                                <div class="error" id="passwordError"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="confirmPassword">Confirm Password</label>
                                <div class="password-wrapper">
                                    <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Re-enter password" minlength="8">
                                    <button type="button" class="toggle-password" onclick="togglePassword('confirmPassword')">👁️</button>
                                </div>
                                <div class="error" id="confirmError"></div>
                            </div>
                            
                            <button type="submit">Reset Password</button>
                        </form>
                        
                        <div id="successMessage" style="display: none; margin-top: 20px; padding: 15px; background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; color: #15803d;">
                            <p style="margin: 0; font-weight: 600;">✓ Password reset successfully!</p>
                            <p style="margin-top: 8px; font-size: 13px;">Redirecting to login...</p>
                        </div>
                    </div>
                    
                    <script>
                        function togglePassword(fieldId) {
                            const field = document.getElementById(fieldId);
                            field.type = field.type === 'password' ? 'text' : 'password';
                        }
                        
                        document.getElementById('resetForm').addEventListener('submit', async (e) => {
                            e.preventDefault();
                            
                            const password = document.getElementById('password').value;
                            const confirmPassword = document.getElementById('confirmPassword').value;
                            
                            // Clear errors
                            document.getElementById('passwordError').style.display = 'none';
                            document.getElementById('confirmError').style.display = 'none';
                            
                            // Validation
                            if (password.length < 8) {
                                document.getElementById('passwordError').textContent = 'Password must be at least 8 characters';
                                document.getElementById('passwordError').style.display = 'block';
                                return;
                            }
                            
                            if (password !== confirmPassword) {
                                document.getElementById('confirmError').textContent = 'Passwords do not match';
                                document.getElementById('confirmError').style.display = 'block';
                                return;
                            }
                            
                            try {
                                const response = await fetch('/api/v1/auth/reset-password', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ token: '${token}', password })
                                });
                                
                                const data = await response.json();
                                
                                if (response.ok) {
                                    document.getElementById('resetForm').style.display = 'none';
                                    document.getElementById('successMessage').style.display = 'block';
                                    setTimeout(() => {
                                        window.location.href = '${process.env.FRONTEND_URL || 'https://craftathon.vercel.app'}/login';
                                    }, 2000);
                                } else {
                                    document.getElementById('passwordError').textContent = data.message || 'Failed to reset password';
                                    document.getElementById('passwordError').style.display = 'block';
                                }
                            } catch (error) {
                                document.getElementById('passwordError').textContent = 'Network error. Please try again.';
                                document.getElementById('passwordError').style.display = 'block';
                            }
                        });
                    </script>
                </body>
            </html>
        `);
    } catch (err) {
        next(err);
    }
};

// ─── Reset Password (POST - Update Password) ───────────────────────────────────
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        const user = await prisma.user.findFirst({
            where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
        });
        if (!user) throw new AppError("Invalid or expired reset token.", 400);

        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash, resetToken: null, resetTokenExpiry: null },
        });
        // Invalidate all refresh tokens
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

        sendSuccess(res, {}, "Password reset successful. Please log in.");
    } catch (err) {
        next(err);
    }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                phone: true, role: true, isEmailVerified: true, isActive: true, createdAt: true,
                profile: true,
            },
        });
        sendSuccess(res, { user });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, verifyEmail, login, refreshToken, logout, forgotPassword, resetPasswordForm, resetPassword, getMe };
