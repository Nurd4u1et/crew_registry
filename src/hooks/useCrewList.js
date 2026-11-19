import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { crewKeys } from "../services/queryKeys";
import { fetchCrewList } from "../services/service";

export default function useCrewList(query) {
  const q = useQuery({
    queryKey: crewKeys.list(query),
    queryFn: () => fetchCrewList(query),
    placeholderData: keepPreviousData,
  });

  let phase = "success";
  if (q.isError && q.data === undefined) phase = "error";
  else if (q.isPending || q.isPlaceholderData) phase = "loading";

  return {
    phase,
    data: q.data ?? null,
    error: q.error?.message ?? "",
    reload: () => q.refetch(),
  };
}

