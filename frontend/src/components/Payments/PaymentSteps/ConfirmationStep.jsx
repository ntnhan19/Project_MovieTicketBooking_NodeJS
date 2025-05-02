// frontend/src/components/Payments/PaymentSteps/ConfirmationStep.jsx
import React from 'react';
import { Divider } from 'antd';

const ConfirmationStep = ({ showtimeDetails, seatDetails, totalPrice }) => {
  // Hiển thị thông tin ghế đã chọn
  const renderSelectedSeats = () => {
    if (!seatDetails || !seatDetails.length) return (
      <div className="text-text-secondary italic py-2">Không có ghế nào được chọn</div>
    );

    return (
      <div className="py-2">
        {seatDetails.map((seat, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-border-light last:border-0">
            <div className="text-text-primary">
              {index + 1}. Ghế {seat.row}{seat.column || seat.number}
            </div>
            <div className="font-medium text-primary">
              {seat.price?.toLocaleString("vi-VN") || "0"}đ
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="confirmation-step w-full animate-fadeIn">
      <div className="bg-light-bg-secondary p-6 rounded-lg shadow-card">
        {showtimeDetails && (
          <>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-full md:w-1/3 lg:w-1/4">
                {showtimeDetails.movie.posterUrl && (
                  <img 
                    src={showtimeDetails.movie.posterUrl} 
                    alt={showtimeDetails.movie.title} 
                    className="w-full rounded-lg shadow-sm"
                  />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-text-primary mb-4">{showtimeDetails.movie.title}</h3>
                <div className="mb-2">
                  <span className="text-text-secondary">Thời lượng: {showtimeDetails.movie.duration} phút</span>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
                  <div className="flex items-center">
                    <span className="w-32 font-medium text-text-primary">Rạp:</span>
                    <span className="text-text-secondary">{showtimeDetails.hall.cinema.name}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="w-32 font-medium text-text-primary">Phòng:</span>
                    <span className="text-text-secondary">{showtimeDetails.hall.name}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="w-32 font-medium text-text-primary">Suất chiếu:</span>
                    <span className="text-text-secondary">
                      {new Date(showtimeDetails.startTime).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}{" "}
                      -{" "}
                      {new Date(showtimeDetails.endTime).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="w-32 font-medium text-text-primary">Ngày:</span>
                    <span className="text-text-secondary">
                      {new Date(showtimeDetails.startTime).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Divider className="my-6" />

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h4 className="text-lg font-medium text-text-primary mb-3">Thông tin ghế</h4>
              {renderSelectedSeats()}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center py-2 border-b border-border-light">
                <span className="font-medium text-text-primary">Tổng tiền vé</span>
                <span className="text-text-primary">{totalPrice.toLocaleString("vi-VN")}đ</span>
              </div>
              
              <div className="flex justify-between items-center pt-3">
                <span className="font-bold text-text-primary text-lg">Tổng cộng</span>
                <span className="font-bold text-primary text-lg">
                  {totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmationStep;