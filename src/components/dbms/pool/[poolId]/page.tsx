import { useParams } from "next/navigation";

export default function PoolPage() {
  const params = useParams<{ poolId: string }>();
  return <div>Pool Details for {params.poolId}</div>;
}
