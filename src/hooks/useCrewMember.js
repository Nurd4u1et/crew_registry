import { useQuery, useQueryClient } from "@tanstack/react-query";
import { crewKeys } from "../services/queryKeys";
import { fetchCrewMember, NOT_FOUND_MESSAGE } from "../services/service";

export default function useCrewMember(id) {
  const queryClient = useQueryClient();
  const enabled = id !== null && id !== undefined;

  const q = useQuery({
    queryKey: crewKeys.detail(id),
    queryFn: () => fetchCrewMember(id),
    enabled,
    retry: (count, err) => err.message !== NOT_FOUND_MESSAGE && count < 1,
  });

  let phase = "success";
  if (!enabled) phase = "notfound";
  else if (q.isError && q.data === undefined) {
    phase = q.error.message === NOT_FOUND_MESSAGE ? "notfound" : "error";
  } else if (q.isPending) phase = "loading";

  return {
    phase,
    member: q.data ?? null,
    error: q.error?.message ?? "",
    reload: () => q.refetch(),
    setMember: (member) => queryClient.setQueryData(crewKeys.detail(member.id), member),
  };
}

