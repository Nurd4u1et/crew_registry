import { useQuery } from "@tanstack/react-query";
import { crewKeys } from "../services/queryKeys";
import { fetchAllCrew } from "../services/service";

export default function useAllCrew() {
  const q = useQuery({
    queryKey: crewKeys.roster(),
    queryFn: fetchAllCrew,
  });

  let phase = "success";
  if (q.isError && q.data === undefined) phase = "error";
  else if (q.isPending) phase = "loading";

  return {
    phase,
    crew: q.data ?? [],
    error: q.error?.message ?? "",
    reload: () => q.refetch(),
  };
}

