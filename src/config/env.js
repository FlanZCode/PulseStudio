import dotenv from 'dotenv';
dotenv.config({ override: true });
export const PORT = Number(process.env.PORT || 24847);
export const REMOTE_WS_URL = process.env.REMOTE_WS_URL ;
export const AUTH_TOKEN = process.env.AUTH_TOKEN;
export const USER_AGENT = 'PulseStudio-WS-Bridge/1.0';

