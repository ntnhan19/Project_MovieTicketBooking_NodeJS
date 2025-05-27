const nodemailer = require('nodemailer');

// Tạo transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: process.env.MAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Gửi email xác nhận vé với mã QR và đơn bắp nước
exports.sendTicketConfirmationEmail = async (
  user,
  ticket,
  movie,
  cinema,
  showtime,
  seat,
  qrCodeUrl,
  concessionOrder = null
) => {
  const date = new Date(showtime.startTime);
  const formattedDate = date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let concessionHtml = '';
  if (concessionOrder && concessionOrder.items?.length > 0) {
    const itemsHtml = concessionOrder.items.map(
      (item) => `
      <li>${item.name} x ${item.quantity} - ${new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(item.price * item.quantity)}</li>
    `
    ).join('');
    concessionHtml = `
      <h3 style="color: #333; margin-top: 20px;">Đơn hàng bắp nước</h3>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
        <p><strong>Mã đơn hàng:</strong> ${concessionOrder.id}</p>
        <p><strong>Sản phẩm:</strong></p>
        <ul>${itemsHtml}</ul>
        <p><strong>Tổng tiền:</strong> ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(concessionOrder.totalAmount)}</p>
      </div>
    `;
  }

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || 'DHL Cinema'}" <${
      process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USER
    }>`,
    to: user.email,
    subject: `Xác nhận đặt vé phim ${movie.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">Xác nhận đặt vé</h1>
        <div style="text-align: center; margin: 20px 0;">
          <img src="${
            movie.posterUrl || movie.logo
          }" alt="${movie.title}" style="max-width: 200px; border-radius: 5px;">
        </div>
        <h2 style="color: #333; text-align: center;">${movie.title}</h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p><strong>Rạp chiếu:</strong> ${cinema.name}</p>
          <p><strong>Địa chỉ:</strong> ${cinema.address}</p>
          <p><strong>Ngày chiếu:</strong> ${formattedDate}</p>
          <p><strong>Giờ chiếu:</strong> ${formattedTime}</p>
          <p><strong>Ghế:</strong> ${seat.row}${seat.column}</p>
          <p><strong>Giá vé:</strong> ${new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(ticket.price)}</p>
          <p><strong>Mã vé:</strong> ${ticket.id}</p>
        </div>
        ${concessionHtml}
        <h3 style="color: #333; margin-top: 20px;">Mã QR của bạn:</h3>
        <div style="text-align: center; margin: 20px 0;">
          <img src="${qrCodeUrl}" alt="Mã QR" style="width: 200px; height: 200px;" />
        </div>
        <p style="margin-top: 20px;">Cảm ơn bạn đã chọn DHL Cinema. Vui lòng xuất trình mã QR này khi đến rạp.</p>
        <p>Chúc bạn có trải nghiệm xem phim tuyệt vời!</p>
        <p>Trân trọng,<br>Đội ngũ DHL Cinema</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email xác nhận đã gửi đến ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('Lỗi khi gửi email xác nhận vé:', error);
    throw new Error('Không thể gửi email xác nhận vé');
  }
};

// Gửi email reset mật khẩu
exports.sendPasswordResetEmail = async (user, resetUrl) => {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || 'DHL Cinema'}" <${
      process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USER
    }>`,
    to: user.email,
    subject: 'Đặt lại mật khẩu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">Đặt lại mật khẩu</h1>
        <p>Xin chào ${user.name},</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu từ bạn.</p>
        <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
        </div>
        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br>Đội ngũ DHL Cinema</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Lỗi khi gửi email đặt lại mật khẩu:', error);
    throw new Error('Không thể gửi email đặt lại mật khẩu');
  }
};

// Gửi email xác thực tài khoản
exports.sendVerificationEmail = async (user, verificationUrl) => {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || 'DHL Cinema'}" <${
      process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USER
    }>`,
    to: user.email,
    subject: 'Xác thực tài khoản',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">Xác thực tài khoản</h1>
        <p>Xin chào ${user.name},</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại DHL Cinema.</p>
        <p>Vui lòng nhấp vào liên kết dưới đây để xác thực tài khoản của bạn:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${verificationUrl}" style="display: inline-block; background-color: #2196F3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Xác thực tài khoản</a>
        </div>
        <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
        <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br>Đội ngũ DHL Cinema</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Lỗi khi gửi email xác thực tài khoản:', error);
    throw new Error('Không thể gửi email xác thực tài khoản');
  }
};