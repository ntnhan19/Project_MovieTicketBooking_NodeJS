import React from "react";
import MovieList from "../components/MovieList";
import BookingOptions from "../components/BookingOptions";

const MoviePage = ({ category }) => {
  return (
    <div className="p-10">
      <BookingOptions />
      <MovieList category={category} /> {/* Truyền category vào MovieList */}
    </div>
  );
};

export default MoviePage;
