// Admin/src/App.jsx
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

// Halls components
import HallList from "./components/Halls/HallList";
import HallEdit from "./components/Halls/HallEdit";
import HallCreate from "./components/Halls/HallCreate";
import HallShow from "./components/Halls/HallShow";

// Cinemas components
import CinemaList from "./components/Cinemas/CinemaList";
import CinemaEdit from "./components/Cinemas/CinemaEdit";
import CinemaCreate from "./components/Cinemas/CinemaCreate";
import CinemaShow from "./components/Cinemas/CinemaShow";


//Promotions components
import PromotionList from './components/Promotions/PromotionList';
import PromotionEdit from './components/Promotions/PromotionEdit';
import PromotionCreate from './components/Promotions/PromotionCreate';
import PromotionShow from './components/Promotions/PromotionShow';

// Users components
import UserList from "./components/Users/UserList";
import UserEdit from "./components/Users/UserEdit";
import UserCreate from "./components/Users/UserCreate";
import UserShow from "./components/Users/UserShow";


// Icons
import MovieIcon from "@mui/icons-material/Movie";
import CategoryIcon from "@mui/icons-material/Category";
import ScheduleIcon from '@mui/icons-material/Schedule';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PlaceIcon from '@mui/icons-material/Place';
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import UserIcon from "@mui/icons-material/Person";


function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
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
      <Resource
        name="halls"
        list={HallList}
        edit={HallEdit}
        create={HallCreate}
        show={HallShow}
        icon={MeetingRoomIcon}
      />
      <Resource
        name="cinemas"
        list={CinemaList}
        edit={CinemaEdit}
        create={CinemaCreate}
        show={CinemaShow}
        icon={PlaceIcon}
      />
      <Resource
        name="promotions"
        list={PromotionList}
        edit={PromotionEdit}
        create={PromotionCreate}
        show={PromotionShow}
        icon={LocalOfferIcon}
      />
      <Resource
        name="users"
        list={UserList}
        edit={UserEdit}
        create={UserCreate}
        show={UserShow}
        icon={UserIcon}
      />
    </Admin>
  );
}

export default App;
