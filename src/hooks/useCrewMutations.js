import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crewKeys } from "../services/queryKeys";
import { addCrewMember, editCrewMember, removeCrewMember } from "../services/service";

export function useAddCrewMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCrewMember,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crewKeys.all }),
  });
}

export function useEditCrewMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }) => editCrewMember(id, changes),
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData(crewKeys.detail(id), updated);
      return queryClient.invalidateQueries({ queryKey: crewKeys.all });
    },
  });
}

export function useDeleteCrewMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeCrewMember,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: crewKeys.detail(id) });
      return queryClient.invalidateQueries({ queryKey: crewKeys.all });
    },
  });
}

