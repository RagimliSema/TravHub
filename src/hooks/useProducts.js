import { productApi } from "../services/api";
import { toTour } from "../utils/products";
import { useRequest } from "./useRequest";

/*
  Backend-dən məhsul(lar) yükləyir və tur kartı formasına çevirir.
  Yeni sorğu gedərkən köhnə nəticə görünməyə davam edir (məs. "Load More"-da
  kartlar yox olmur), ona görə loading ilə data birlikdə qayıdır.
*/

// məhsullar siyahısı: useProducts({ limit: 9, sort: "newest", search, category })
export function useProducts(params = {}) {
  const key = JSON.stringify(params);
  const { data, error, loading, retry } = useRequest((signal) => productApi.list(params, signal), key);

  return {
    tours: data?.products.map(toTour) ?? [],
    total: data?.total ?? 0,
    loading,
    error,
    retry,
  };
}

// bir məhsul: useProduct(id)
export function useProduct(id) {
  const { data, error, loading, retry } = useRequest(
    (signal) => (id ? productApi.get(id, signal) : Promise.resolve(null)),
    id ?? "none"
  );

  return { tour: data?.product ? toTour(data.product) : null, loading, error, retry };
}
