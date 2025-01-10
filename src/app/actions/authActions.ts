'use server';

import { auth, signIn, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { LoginSchema } from '@/lib/schemas/LoginSchema';
import { registerSchema, RegisterSchema } from '@/lib/schemas/RegisterSchema';
import { ActionResult } from '@/types';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';

export async function signInUser(data: LoginSchema): Promise<ActionResult<string>> {
    try {
        await signIn('credentials', {
            email: data.email,
            password: data.password
            redirect: false
        });

        return { status: 'success', data: 'Logged in' }
    } catch (error) {
        console.log(error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { status: 'error', error: 'Invalid credentials' }
                default:
                    return { status: 'error', error: 'Something went wrong' }
            }
        } else {
            return { status: 'error', error: 'Something else went wrong' }
        }
    }
}

export async function signOutUser() {
    await signOut({ redirectTo: '/' });
}

export async function registerUser(data: RegisterSchema): Promise<ActionResult<User>> {
    try {
        const validated = registerSchema.safeParse(data);

        if (!validated.success) {
            return { status: 'error', error: validated.error.errors }
        }

        const { name, email, password } = validated.data;

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) return { status: 'error', error: 'User already exists' };

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
            }
        })

        return { status: 'success', data: user }
    } catch (error) {
        console.log(error);
        return { status: 'error', error: 'Something went wrong' }
    }

}

export async function verifyEmail(token: string): Promise<ActionResult<string>> {
    try {
        const existingToken = await getTokenByToken(token);

        if (!existingToken) {
            return { status: 'error', error: 'Invalid token' }
        }

        const hasExpired = new Date() > existingToken.expires;

        if (hasExpired) {
            return { status: 'error', error: 'Token has expired' }
        }

        const existingUser = await getUserByEmail(existingToken.email);

        if (!existingUser) {
            return { status: 'error', error: 'User not found' }
        }

        await prisma.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() }
        });

        await prisma.token.delete({ where: { id: existingToken.id } })

        return { status: 'success', data: 'Success' }

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function generateResetPasswordEmail(email: string): Promise<ActionResult<string>> {
    try {
        const existingUser = await getUserByEmail(email);

        if (!existingUser) {
            return { status: 'error', error: 'Email not found' }
        }

        const token = await generateToken(email, TokenType.PASSWORD_RESET);

        await sendPasswordResetEmail(token.email, token.token);

        return { status: 'success', data: 'Password reset email has been sent.  Please check your emails' }
    } catch (error) {
        console.log(error);
        return { status: 'error', error: 'Something went wrong' }
    }
}

export async function getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
}

export async function getAuthUserId() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) throw new Error('Unauthorized');

    return userId;
}