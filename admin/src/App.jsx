import { Admin, Resource, CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
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

// Tickets components
import TicketEdit from "./components/Tickets/TicketEdit";
import TicketList from "./components/Tickets/TicketList";
import TicketShow from "./components/Tickets/TicketShow";
import TicketCreate from "./components/Tickets/TicketCreate";

// Payment components
import PaymentList from "./components/Payments/PaymentList";
import PaymentShow from "./components/Payments/PaymentShow";

// Dashboard component
import Dashboard from "./components/Dashboard/Dashboard";

// Profile component
import ProfilePage from "./components/Profile/ProfilePage";

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
  CreditCardIcon,
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
        <CustomRoutes>
          <Route path="/profile" element={<ProfilePage />} />
        </CustomRoutes>
        <Resource
          name="movies"
          list={MovieList}
          edit={MovieEdit}
          create={MovieCreate}
          show={MovieShow}
          icon={FilmIcon}
          options={{
            label: 'Quản lý phim',
            menuIcon: <FilmIcon className="w-5 h-5" />,
            recordRepresentation: 'title'
          }}
        />
        <Resource
          name="genres"
          list={GenreList}
          edit={GenreEdit}
          create={GenreCreate}
          show={GenreShow}
          options={{
            label: 'Quản lý thể loại',
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
            label: 'Quản lý lịch chiếu',
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
            label: 'Quản lý phòng chiếu',
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
            label: 'Quản lý rạp phim',
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
            label: 'Quản lý khuyến mãi',
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
            label: 'Quản lý người dùng',
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
            label: "Quản lý vé",
            menuIcon: <TicketIcon className="w-5 h-5" />
          }}
        />
        <Resource
          name="concession-categories"
          list={ConcessionCategoryList}
          edit={ConcessionCategoryEdit}
          create={ConcessionCategoryCreate}
          show={ConcessionCategoryShow}
          options={{
            label: 'Danh mục bắp nước',
            menuIcon: <QueueListIcon className="w-5 h-5" />
          }}
        />
        <Resource
          name="concession-items"
          list={ConcessionItemList}
          edit={ConcessionItemEdit}
          create={ConcessionItemCreate}
          show={ConcessionItemShow}
          options={{
            label: 'Sản phẩm bắp nước',
            menuIcon: <CubeIcon className="w-5 h-5" />
          }}
        />
        <Resource
          name="concession-combos"
          list={ConcessionComboList}
          edit={ConcessionComboEdit}
          create={ConcessionComboCreate}
          show={ConcessionComboShow}
          options={{
            label: 'Combo bắp nước',
            menuIcon: <ShoppingBagIcon className="w-5 h-5" />
          }}
        />
        <Resource
          name="concession-orders"
          list={ConcessionOrderList}
          edit={ConcessionOrderEdit}
          create={ConcessionOrderCreate}
          show={ConcessionOrderShow}
          options={{
            label: 'Đơn hàng bắp nước',
            menuIcon: <ShoppingCartIcon className="w-5 h-5" />
          }}
        />
        <Resource
          name="payments"
          list={PaymentList}
          show={PaymentShow}
          icon={CreditCardIcon}
          options={{
            label: "Quản lý thanh toán",
            menuIcon: <CreditCardIcon className="w-5 h-5" />,
            requiredPermission: "admin",
          }}
        />
      </Admin>
    </div>
  );
}

export default App;