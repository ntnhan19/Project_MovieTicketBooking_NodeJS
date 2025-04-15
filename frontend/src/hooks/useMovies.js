// frontend/src/hooks/useMovies.js
import { useState, useEffect } from "react";
import { movieApi } from "../api/movieApi";
import { message } from "antd";

const useMovies = () => {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [now, soon] = await Promise.all([
          movieApi.getNowShowing(),
          movieApi.getComingSoon()
        ]);

        const withFullPoster = (list) =>
          list.map((movie) => ({
            ...movie,
            poster: movie.poster?.startsWith("http")
              ? movie.poster
              : `${import.meta.env.VITE_BACKEND_URL}/${movie.poster}`,
          }));

        setNowShowing(withFullPoster(now));
        setComingSoon(withFullPoster(soon));
      } catch (err) {
        console.error(err);
        message.error("Không thể tải danh sách phim.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { nowShowing, comingSoon, loading };
};

export default useMovies;
