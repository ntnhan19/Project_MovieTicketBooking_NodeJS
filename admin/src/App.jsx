//src/App.jsx
import { Admin, Resource } from "react-admin";
import dataProvider from "./services/dataProvider";
import authProvider from "./services/authProvider";
import CustomLayout from "./layout/CustomLayout";

// Movies components
import MovieList from "./components/Movies/MovieList";
import MovieEdit from "./components/Movies/MovieEdit";
import MovieCreate from "./components/Movies/MovieCreate";
import MovieShow from "./components/Movies/MovieShow";

// Genres components
import GenreList from "./components/Genres/GenreList";
import GenreEdit from "./components/Genres/GenreEdit";
import GenreCreate from "./components/Genres/GenreCreate";
import GenreShow from "./components/Genres/GenreShow";

// Showtimes components
import ShowtimeList from "./components/Showtimes/ShowtimeList";
import ShowtimeEdit from "./components/Showtimes/ShowtimeEdit";
import ShowtimeCreate from "./components/Showtimes/ShowtimeCreate";
import ShowtimeShow from "./components/Showtimes/ShowtimeShow";

// Icons
import MovieIcon from "@mui/icons-material/Movie";
import CategoryIcon from "@mui/icons-material/Category";
import ScheduleIcon from '@mui/icons-material/Schedule';

function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      layout={CustomLayout}
    >
      <Resource
        name="movies"
        list={MovieList}
        edit={MovieEdit}
        create={MovieCreate}
        show={MovieShow}
        icon={MovieIcon}
      />
      <Resource
        name="genres"
        list={GenreList}
        edit={GenreEdit}
        create={GenreCreate}
        show={GenreShow}
        icon={CategoryIcon}
      />
      <Resource
        name="showtimes"
        list={ShowtimeList}
        edit={ShowtimeEdit}
        create={ShowtimeCreate}
        show={ShowtimeShow}
        icon={ScheduleIcon}
      />
    </Admin>
  );
}

export default App;
