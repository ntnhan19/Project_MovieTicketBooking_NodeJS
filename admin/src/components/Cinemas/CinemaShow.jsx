// admin/src/components/Cinemas/CinemaShow.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import cinemaService from "../../services/cinemaService";

const CinemaShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cinema, setCinema] = useState(null);
  const [halls, setHalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCinemaAndHalls = async () => {
      try {
        setIsLoading(true);
        // Lấy thông tin rạp chiếu phim
        const cinemaResponse = await cinemaService.getOne(id);
        setCinema(cinemaResponse.data);
        
        // Lấy danh sách phòng chiếu thuộc rạp này
        const hallsResponse = await cinemaService.getHallsByCinema(id);
        setHalls(hallsResponse.data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin rạp chiếu phim:", err);
        setError("Không thể tải thông tin rạp chiếu phim. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCinemaAndHalls();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-600 dark:text-red-400">
        <p>{error}</p>
        <button 
          onClick={() => navigate("/cinemas")}
          className="mt-2 text-sm font-medium text-primary hover:text-primary-dark"
        >
          Quay lại danh sách rạp chiếu phim
        </button>
      </div>
    );
  }

  if (!cinema) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-yellow-600 dark:text-yellow-400">
        <p>Không tìm thấy thông tin rạp chiếu phim.</p>
        <button 
          onClick={() => navigate("/cinemas")}
          className="mt-2 text-sm font-medium text-primary hover:text-primary-dark"
        >
          Quay lại danh sách rạp chiếu phim
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            {cinema.name}
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
            Chi tiết rạp chiếu phim
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/cinemas/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Chỉnh sửa
          </Link>
          <button
            onClick={() => navigate("/cinemas")}
            className="inline-flex items-center px-4 py-2 border border-border dark:border-border-dark rounded-md shadow-sm text-sm font-medium text-text-primary dark:text-text-primary-dark bg-white dark:bg-background-paper-dark hover:bg-gray-50 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Quay lại
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              Thông tin cơ bản
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                  Tên rạp
                </h3>
                <p className="mt-1 text-text-primary dark:text-text-primary-dark">
                  {cinema.name}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                  Địa chỉ
                </h3>
                <p className="mt-1 text-text-primary dark:text-text-primary-dark">
                  {cinema.address}
                </p>
              </div>
              
              {cinema.mapUrl && (
                <div>
                  <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                    URL Bản đồ
                  </h3>
                  <a 
                    href={cinema.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-primary hover:text-primary-dark break-all"
                  >
                    {cinema.mapUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div>
            {cinema.image && (
              <div>
                <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                  Hình ảnh rạp
                </h3>
                <div className="mt-1 border border-border dark:border-border-dark rounded-md overflow-hidden">
                  <img
                    src={cinema.image}
                    alt={cinema.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x200?text=Không+tải+được+ảnh";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách phòng chiếu */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
              Phòng chiếu ({halls.length})
            </h2>
            <Link
              to={`/cinemas/${id}/halls/create`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Thêm phòng chiếu
            </Link>
          </div>

          {halls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border dark:divide-border-dark">
                <thead className="bg-gray-50 dark:bg-background-default-dark">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                      Tên phòng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                      Tổng số ghế
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                      Số hàng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                      Số cột
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Tuỳ chọn</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-background-paper-dark divide-y divide-border dark:divide-border-dark">
                  {halls.map((hall) => (
                    <tr key={hall.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                        {hall.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                        {hall.totalSeats}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                        {hall.rows}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                        {hall.columns}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/halls/${hall.id}/edit`}
                          className="text-primary hover:text-primary-dark mr-4"
                        >
                          Sửa
                        </Link>
                        <Link
                          to={`/halls/${hall.id}`}
                          className="text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark"
                        >
                          Xem
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-background-default-dark text-center py-8 rounded-md">
              <p className="text-text-secondary dark:text-text-secondary-dark">
                Chưa có phòng chiếu nào được thêm vào rạp này
              </p>
              <Link
                to={`/cinemas/${id}/halls/create`}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Thêm phòng chiếu mới
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CinemaShow;