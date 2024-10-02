export default function getProtocol(){
    const nextHost = process.env.NEXT_PUBLIC_VERCEL_URL;
    
    return nextHost?.includes('localhost') ? 'http' : 'https';
}