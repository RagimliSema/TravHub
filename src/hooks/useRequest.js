import { useCallback, useEffect, useState } from "react";

/*
  API sorğusunu yükləyir: { data, error, loading, retry, mutate }.
  - key dəyişəndə yenidən yüklənir; yeni sorğu gedərkən köhnə data görünməyə davam edir.
  - retry(): eyni sorğunu təkrarla ("Try Again", dəyişiklikdən sonra yenilə).
  - mutate(fn): datanı yerində dəyiş (məs. silinən sətri dərhal çıxar).
*/
export function useRequest(load, key) {
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${key}#${attempt}`;
  const [state, setState] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();

    load(controller.signal)
      .then((data) => setState({ key: requestKey, data, error: null }))
      .catch((error) => {
        if (error.name !== "AbortError") setState((prev) => ({ key: requestKey, data: prev.data, error }));
      });

    return () => controller.abort();
    // load hər render-də yenidən yaranır – sorğunu yalnız requestKey dəyişəndə göndəririk
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const mutate = useCallback((update) => setState((prev) => ({ ...prev, data: update(prev.data) })), []);

  return {
    data: state.data,
    error: state.key === requestKey ? state.error : null,
    loading: state.key !== requestKey,
    retry,
    mutate,
  };
}
