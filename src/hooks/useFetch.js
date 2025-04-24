import { useAuth } from "@clerk/clerk-react";

export default function useFetch() {
  const { getToken } = useAuth();

  const authenticatedFetch = async (url, options = {}) => {
    const token = await getToken({
      skipCache: true,
    });
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    return fetch(url, config).then((res) => res.json());
  };

  return authenticatedFetch;
}
