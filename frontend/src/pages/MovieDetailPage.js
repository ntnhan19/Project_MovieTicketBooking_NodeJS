import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Button } from "antd";

const movies = [
  {
    id: 1,
    title: "Avengers: Endgame",
    image: "/images/avengers.jpg",
    description: "Avengers chiến đấu chống lại Thanos để cứu vũ trụ.",
  },
  {
    id: 2,
    title: "The Batman",
    image: "/images/batman.jpg",
    description:
      "Batman đối đầu với The Riddler và khám phá bí mật của Gotham.",
  },
  {
    id: 3,
    title: "Spider-Man: No Way Home",
    image: "/images/spiderman.jpg",
    description:
      "Spider-Man mở ra đa vũ trụ và chiến đấu với các phản diện cũ.",
  },
  {
    id: 4,
    title: "Doctor Strange 2",
    image: "/images/doctorstrange.jpg",
    description:
      "Doctor Strange khám phá đa vũ trụ và đối mặt với những hiểm họa mới.",
  },
];

const MovieDetailPage = () => {
  const { id } = useParams();
  const movie = movies.find((m) => m.id === parseInt(id));

  if (!movie) {
    return (
      <h2 className="text-center text-red-500 mt-10">Không tìm thấy phim</h2>
    );
  }

  return (
    <div className="p-10 flex flex-col items-center">
      <Card
        cover={
          <img
            alt={movie.title}
            src={movie.image}
            className="h-96 object-cover"
          />
        }
        className="max-w-lg"
      >
        <h1 className="text-2xl font-bold">{movie.title}</h1>
        <p className="mt-4">{movie.description}</p>
        <Link to={`/booking/${movie.id}`}>
          <Button type="primary" className="mt-4">
            Đặt Vé
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default MovieDetailPage;
