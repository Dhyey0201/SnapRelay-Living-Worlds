import World from '@/components/World';
export default async function RelayPage({params}:{params:Promise<{relayId:string}>}){const {relayId}=await params;return <World relayId={relayId}/>;}
