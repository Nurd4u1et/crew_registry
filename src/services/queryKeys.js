export const crewKeys = {
  all: ["crew"],
  lists: () => ["crew", "list"],
  list: (query) => ["crew", "list", query],
  detail: (id) => ["crew", "detail", String(id)],
  roster: () => ["crew", "roster"],
};

