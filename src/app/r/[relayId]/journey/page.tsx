import Journey from '@/components/Journey';
export default async function JourneyPage({params}:{params:Promise<{relayId:string}>}){const {relayId}=await params;return <Journey relayId={relayId}/>;}
