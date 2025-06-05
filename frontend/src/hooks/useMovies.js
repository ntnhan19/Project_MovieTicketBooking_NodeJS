import { useState, useEffect } from "react";
import { movieApi } from "../api/movieApi";
import { message } from "antd";

const useMovies = ({ enable = true, transformPoster = true } = {}) => {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 

  useEffect(() => {
    if (!enable) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [now, soon] = await Promise.all([
          movieApi.getNowShowing(),
          movieApi.getComingSoon(),
        ]);

        const formatPoster = (movie) => {
          if (!transformPoster) return movie;
          return {
            ...movie,
            poster: movie.poster?.startsWith("http")
              ? movie.poster
              : `${import.meta.env.VITE_BACKEND_URL}/${movie.poster}`,
          };
        };

        setNowShowing(now.map(formatPoster));
        setComingSoon(soon.map(formatPoster));
      } catch (err) {
        setError(err);
        message.error("Không thể tải danh sách phim.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [enable, transformPoster]);

  return { nowShowing, comingSoon, loading, error };
};

export default useMovies;
