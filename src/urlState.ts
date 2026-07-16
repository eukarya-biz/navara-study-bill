const EMPIRE_PARAM = "empire";
const GOODS_PARAM = "goods";

export type UrlState = {
  empireId?: string;
  categoryKeys?: string[];
};

export function readInitialUrlState(): UrlState {
  const params = new URLSearchParams(window.location.search);
  const empireId = params.get(EMPIRE_PARAM) ?? undefined;
  const goods = params.get(GOODS_PARAM);
  const categoryKeys = goods ? goods.split(",").filter(Boolean) : undefined;
  return { empireId, categoryKeys };
}

export function writeUrlState(state: UrlState): void {
  const params = new URLSearchParams();
  if (state.empireId) params.set(EMPIRE_PARAM, state.empireId);
  if (state.categoryKeys) params.set(GOODS_PARAM, state.categoryKeys.join(","));

  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", url);
}
