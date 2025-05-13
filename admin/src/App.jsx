// src/App.jsx
import { Admin, Resource } from "react-admin";
import dataProvider from "./services/dataProvider";
import authProvider from "./services/authProvider";

// Layout mới sử dụng Tailwind
import AdminLayout from "./layout/AdminLayout";

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

// Promotions components
import PromotionList from "./components/Promotions/PromotionList";
import PromotionEdit from "./components/Promotions/PromotionEdit";
import PromotionCreate from "./components/Promotions/PromotionCreate";
import PromotionShow from "./components/Promotions/PromotionShow";

// Users components
import UserList from "./components/Users/UserList";
import UserEdit from "./components/Users/UserEdit";
import UserCreate from "./components/Users/UserCreate";
import UserShow from "./components/Users/UserShow";

// Concession Category components
import ConcessionCategoryList from "./components/ConcessionCategories/ConcessionCategoryList";
import ConcessionCategoryEdit from "./components/ConcessionCategories/ConcessionCategoryEdit";
import ConcessionCategoryCreate from "./components/ConcessionCategories/ConcessionCategoryCreate";
import ConcessionCategoryShow from "./components/ConcessionCategories/ConcessionCategoryShow";

// Concession Item components
import ConcessionItemList from "./components/ConcessionItems/ConcessionItemList";
import ConcessionItemEdit from "./components/ConcessionItems/ConcessionItemEdit";
import ConcessionItemCreate from "./components/ConcessionItems/ConcessionItemCreate";
import ConcessionItemShow from "./components/ConcessionItems/ConcessionItemShow";

// Concession Combo components
import ConcessionComboList from "./components/ConcessionCombos/ConcessionComboList";
import ConcessionComboEdit from "./components/ConcessionCombos/ConcessionComboEdit";
import ConcessionComboCreate from "./components/ConcessionCombos/ConcessionComboCreate";
import ConcessionComboShow from "./components/ConcessionCombos/ConcessionComboShow";

// Concession Order components
import ConcessionOrderList from "./components/ConcessionOrders/ConcessionOrderList";
import ConcessionOrderEdit from "./components/ConcessionOrders/ConcessionOrderEdit";
import ConcessionOrderCreate from "./components/ConcessionOrders/ConcessionOrderCreate";
import ConcessionOrderShow from "./components/ConcessionOrders/ConcessionOrderShow";

import TicketEdit from "./components/Tickets/TicketEdit";
import TicketList from "./components/Tickets/TicketList";
import TicketShow from "./components/Tickets/TicketShow";
import TicketCreate from "./components/Tickets/TicketCreate";

// Dashboard component
import Dashboard from "./components/Dashboard/Dashboard";

// Icons
import {
  FilmIcon,
  TagIcon,
  ClockIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  TagIcon as PromotionIcon,
  UserIcon,
  TicketIcon,
  ShoppingBagIcon,
  CubeIcon,
  QueueListIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

function App() {
  return (
    <div className="font-sans min-h-screen bg-background-light dark:bg-background-dark">
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        layout={AdminLayout}
        dashboard={Dashboard}
        disableTelemetry
        requireAuth
      >
        <Resource
          name="movies"
          list={MovieList}
          edit={MovieEdit}
          create={MovieCreate}
          show={MovieShow}
          icon={FilmIcon}
          options={{ 
            label: 'Phim',
            menuIcon: <FilmIcon className="w-5 h-5" />
          }}
        />
        <Resource
          name="genres"
          list={GenreList}
          edit={GenreEdit}
          create={GenreCreate}
          show={GenreShow}
          options={{ 
            label: 'Thể loại',
            menuIcon: <TagIcon className="w-5 h-5" /> 
          }}
        />
        <Resource
          name="showtimes"
          list={ShowtimeList}
          edit={ShowtimeEdit}
          create={ShowtimeCreate}
          show={ShowtimeShow}
          options={{ 
            label: 'Lịch chiếu',
            menuIcon: <ClockIcon className="w-5 h-5" /> 
          }}
        />
        <Resource
          name="halls"
          list={HallList}
          edit={HallEdit}
          create={HallCreate}
          show={HallShow}
          options={{ 
            label: 'Phòng chiếu',
            menuIcon: <BuildingOffice2Icon className="w-5 h-5" /> 
          }}
        />
        <Resource
          name="cinemas"
          list={CinemaList}
          edit={CinemaEdit}
          create={CinemaCreate}
          show={CinemaShow}
          options={{ 
            label: 'Rạp phim',
            menuIcon: <MapPinIcon className="w-5 h-5" /> 
          }}
        />
        <Resource
          name="promotions"
          list={PromotionList}
          edit={PromotionEdit}
          create={PromotionCreate}
          show={PromotionShow}
          options={{ 
            label: 'Khuyến mãi',
            menuIcon: <PromotionIcon className="w-5 h-5" /> 
          }}
        />
        <Resource
          name="users"
          list={UserList}
          edit={UserEdit}
          create={UserCreate}
          show={UserShow}
          options={{ 
            label: 'Người dùng',
            menuIcon: <UserIcon className="w-5 h-5" /> 
          }}
        />
        <Resource
          name="tickets"
          list={TicketList}
          edit={TicketEdit} 
          create={TicketCreate}
          show={TicketShow}
          options={{
            label: "Vé",
            menuIcon: <TicketIcon className="w-5 h-5" />
          }}
        />

        {/* Concession Category */}
        <Resource
          name="concession-categories"
          list={ConcessionCategoryList}
          edit={ConcessionCategoryEdit}
          create={ConcessionCategoryCreate}
          show={ConcessionCategoryShow}
          options={{ 
            label: 'Danh mục đồ ăn',
            menuIcon: <QueueListIcon className="w-5 h-5" /> 
          }}
        />
        
        {/* Concession Item */}
        <Resource
          name="concession-items"
          list={ConcessionItemList}
          edit={ConcessionItemEdit}
          create={ConcessionItemCreate}
          show={ConcessionItemShow}
          options={{ 
            label: 'Đồ ăn/Thức uống',
            menuIcon: <CubeIcon className="w-5 h-5" /> 
          }}
        />

        {/* Concession Combo */}
        <Resource
          name="concession-combos"
          list={ConcessionComboList}
          edit={ConcessionComboEdit}
          create={ConcessionComboCreate}
          show={ConcessionComboShow}
          options={{ 
            label: 'Combo đồ ăn',
            menuIcon: <ShoppingBagIcon className="w-5 h-5" /> 
          }}
        />

        {/* Concession Order */}
        <Resource
          name="concession-orders"
          list={ConcessionOrderList}
          edit={ConcessionOrderEdit}
          create={ConcessionOrderCreate}
          show={ConcessionOrderShow}
          options={{ 
            label: 'Đơn hàng đồ ăn',
            menuIcon: <ShoppingCartIcon className="w-5 h-5" /> 
          }}
        />
      </Admin>
    </div>
  );
}

export default App;