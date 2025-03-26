import React, { useState } from "react";
import { Card, Row, Col, Modal, Tag } from "antd";
import { PlayCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";

const movies = [
  {
    id: 1,
    title: "Nhà Gia Tiên",
    image: "/images/img1.jpg",
    releaseDate: "21/02/2025",
    runtime: "1 giờ 57 phút",
    director: "Huỳnh Lập",
    cast: "Huỳnh Lập, Phương Mỹ Chi, NSƯT Hạnh Thuý, NSƯT Huỳnh Đông, Puka...",
    genre: "Supernatural, Family, Comedy - 2D",
    rating: "T18",
    description:
      "Nhà Gia Tiên xoay quanh câu chuyện đa góc nhìn về các thế hệ khác nhau trong một gia đình...",
  },
  {
    id: 2,
    title: "Quỷ Nhập Tràng",
    image: "/images/img2.jpg",
    releaseDate: "07/03/2025",
    runtime: "2 giờ 2 phút",
    director: "Pom Nguyễn",
    cast: "Khả Như, Quang Tuấn,…",
    genre: "Horror - 2D",
    rating: "T18",
    description:
      "Lấy cảm hứng từ truyền thuyết kinh dị nhất về “người chết sống dậy”, Quỷ Nhập Tràng là câu chuyện được lấy bối cảnh tại một ngôi làng chuyên nghề mai táng, gắn liền với những hoạt động đào mộ, tẩm liệm và chôn cất người chết.",
  },
  {
    id: 3,
    title: "FLOW: Lạc Trôi",
    image: "/images/img3.jpg",
    releaseDate: "07/03/2025",
    runtime: "1 giờ 29 phút",
    director: " Gints Zilbalodisn",
    cast: "Gints Zilbalodis",
    genre: "Cartoon - 2D",
    rating: "P",
    description:
      "Trước bối cảnh hậu tận thế, chú mèo xám nhút nhát, vốn luôn sợ nước phải rời bỏ vùng an toàn khi căn nhà thân yêu bị cuốn trôi bởi cơn lũ dữ. Trên hành trình vượt đại dương mênh mông, chú mèo cùng những người bạn đồng hành (Capybara, chó Labrador Retriever, Vượn Cáo, chim Thư ký) phải học cách vượt qua nỗi sợ và chấp nhận những điểm khác biệt để cùng nhau tồn tại.",
  },
  {
    id: 4,
    title: "SÁT THỦ VÔ CÙNG CỰC HÀI",
    image: "/images/img4.jpg",
    releaseDate: "14/03/2025",
    runtime: " 1 giờ 47 phút",
    director: "Choi Won-sub",
    cast: "Rachel Zegler, Gal GadotKwon Sang-woo, Jung Joon-ho, Lee Yi-kyung, Hwang Woo-seul-hye, Kim Sung-oh, Lee Ji-won",
    genre: "Comedy, Action - 2D Dub",
    rating: "T16",
    description:
      "Câu chuyện tiếp nối về cuộc đời làm hoạ sĩ webtoon Jun, người nổi tiếng trong thời gian ngắn với tư cách là tác giả của webtoon Đặc vụ ám sát Jun, nhanh chóng mang danh là nhà văn thiếu não, sau khi Phần 2 bị chỉ trích thảm hại, nhưng mọi thứ thay đổi khi một cuộc tấn công khủng bố ngoài đời thực giống hệt với phần 2 anh vừa xuất bản, khiến Jun bị NIS buộc tội sai là kẻ chủ mưu đằng sau tội ác.",
  },
];

const MovieList = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const showModal = (movie) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="p-10">
      <Row gutter={[16, 16]} justify="center">
        {movies.map((movie) => (
          <Col key={movie.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                <img
                  alt={movie.title}
                  src={movie.image}
                  style={{ height: "500px", objectFit: "cover" }}
                />
              }
              actions={[
                <PlayCircleOutlined
                  key="play"
                  onClick={() => showModal(movie)}
                  style={{ fontSize: "24px" }}
                />,
                <InfoCircleOutlined
                  key="info"
                  onClick={() => showModal(movie)}
                  style={{ fontSize: "24px" }}
                />,
              ]}
            >
              <Card.Meta title={movie.title} />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={850}
        centered
      >
        {selectedMovie && (
          <div style={{ display: "flex", gap: "20px", textAlign: "left" }}>
            {/* Poster bên trái */}
            <img
              src={selectedMovie.image}
              alt={selectedMovie.title}
              style={{
                width: "250px",
                height: "350px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
            {/* Thông tin phim bên phải */}
            <div style={{ flex: 1 }}>
              {/* Tiêu đề + tag độ tuổi */}
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {selectedMovie.title}
                <Tag
                  color="yellow"
                  style={{ fontSize: "16px", fontWeight: "bold" }}
                >
                  {selectedMovie.rating}
                </Tag>
              </h2>
              {/* Thể loại */}
              <p
                style={{
                  fontSize: "16px",
                  color: "gray",
                  marginBottom: "10px",
                }}
              >
                {selectedMovie.genre}
              </p>
              {/* Thông tin phim */}
              <p>
                <b>Khởi Chiếu:</b> {selectedMovie.releaseDate}
              </p>
              <p>
                <b>Thời Lượng:</b> {selectedMovie.runtime}
              </p>
              <p>
                <b>Đạo Diễn:</b> {selectedMovie.director}
              </p>
              <p>
                <b>Diễn Viên:</b> {selectedMovie.cast}
              </p>
              <p style={{ textAlign: "justify", lineHeight: "1.6" }}>
                {selectedMovie.description}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MovieList;
