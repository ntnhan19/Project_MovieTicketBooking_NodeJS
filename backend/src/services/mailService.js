const nodemailer = require("nodemailer");

// Tạo transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: process.env.MAIL_PORT || 587,
  secure: process.env.MAIL_SECURE === "true" || false,
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
  const formattedDate = date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let concessionHtml = "";
  if (concessionOrder && concessionOrder.items?.length > 0) {
    console.log(
      "🍿 Dữ liệu concession order:",
      JSON.stringify(concessionOrder, null, 2)
    );

    const itemsHtml = concessionOrder.items
      .map((item) => {
        // Debug: Log từng item để kiểm tra cấu trúc dữ liệu
        console.log("🍿 Item data:", JSON.stringify(item, null, 2));

        // ✅ XỬ LÝ TÊN SẢN PHẨM - CẢI THIỆN LOGIC
        let itemName = "Sản phẩm không xác định";
        let itemPrice = item.price || 0;

        // Ưu tiên 1: Kiểm tra combo trước
        if (item.combo && item.combo.name) {
          itemName = item.combo.name;
          itemPrice = item.price || item.combo.price || 0;
        }
        // Ưu tiên 2: Kiểm tra item đơn lẻ
        else if (item.item && item.item.name) {
          itemName = item.item.name;
          itemPrice = item.price || item.item.price || 0;
        }
        // ✅ FALLBACK: Nếu cả hai đều null, thử tìm từ API hoặc dữ liệu khác
        else if (item.itemId || item.comboId) {
          // Nếu có ID nhưng relation bị null, cần query lại
          console.warn(
            `⚠️ Missing relation data for item ${item.id}: itemId=${item.itemId}, comboId=${item.comboId}`
          );

          // Tạm thời sử dụng fallback name
          if (item.comboId) {
            itemName = `Combo #${item.comboId}`;
          } else if (item.itemId) {
            itemName = `Sản phẩm #${item.itemId}`;
          }
        }
        // ✅ FALLBACK CUỐI: Sử dụng notes nếu có
        else if (item.notes) {
          itemName = item.notes;
        }

        // Xử lý số lượng
        const itemQuantity = item.quantity || 1;

        console.log(
          `🍿 Processed item: ${itemName} x ${itemQuantity} - ${itemPrice}`
        );

        return `
      <li style="margin-bottom: 8px; padding: 8px; background-color: #fff; border-left: 3px solid #4CAF50;">
        <strong>${itemName}</strong> x ${itemQuantity} - 
        <span style="color: #e53e3e; font-weight: bold;">
          ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(itemPrice * itemQuantity)}
        </span>
      </li>
    `;
      })
      .join("");

    concessionHtml = `
    <div style="margin-top: 25px; border-top: 2px solid #e0e0e0; padding-top: 20px;">
      <h3 style="color: #333; margin-bottom: 15px; display: flex; align-items: center;">
        🍿 Đơn hàng bắp nước
      </h3>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
        <p style="margin-bottom: 10px;">
          <strong style="color: #495057;">Mã đơn hàng:</strong> 
          <span style="color: #007bff;">#${concessionOrder.id}</span>
        </p>
        <p style="margin-bottom: 15px; font-weight: bold; color: #495057;">Sản phẩm đã đặt:</p>
        <ul style="list-style: none; padding: 0; margin: 0 0 15px 0;">
          ${itemsHtml}
        </ul>
        <div style="border-top: 1px solid #dee2e6; padding-top: 15px;">
          <p style="margin: 0; text-align: right; font-size: 18px;">
            <strong style="color: #495057;">Tổng tiền bắp nước:</strong> 
            <span style="color: #e53e3e; font-weight: bold; font-size: 20px;">
              ${new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(concessionOrder.totalAmount || 0)}
            </span>
          </p>
        </div>
      </div>
    </div>
  `;
  }

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || "DHL Cinema"}" <${
      process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USER
    }>`,
    to: user.email,
    subject: `🎬 Xác nhận đặt vé phim "${movie.title}"`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🎬 Xác nhận đặt vé thành công
          </h1>
          <p style="color: #f8f9fa; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            Cảm ơn bạn đã chọn DHL Cinema!
          </p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 25px;">
            <img src="${movie.posterUrl || movie.logo}" alt="${movie.title}" 
                 style="max-width: 200px; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          </div>
          
          <h2 style="color: #333; text-align: center; margin-bottom: 25px; font-size: 24px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
            ${movie.title}
          </h2>
          
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 20px; font-size: 18px;">📍 Thông tin vé xem phim</h3>
            
            <div style="display: grid; gap: 12px;">
              <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                <strong style="color: #495057;">🏢 Rạp chiếu:</strong> 
                <span style="color: #007bff;">${cinema.name}</span>
              </p>
              <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                <strong style="color: #495057;">📍 Địa chỉ:</strong> 
                <span>${cinema.address}</span>
              </p>
              <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                <strong style="color: #495057;">📅 Ngày chiếu:</strong> 
                <span style="color: #28a745;">${formattedDate}</span>
              </p>
              <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                <strong style="color: #495057;">🕐 Giờ chiếu:</strong> 
                <span style="color: #28a745; font-weight: bold;">${formattedTime}</span>
              </p>
              <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                <strong style="color: #495057;">💺 Ghế:</strong> 
                <span style="background-color: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${
                  seat.row
                }${seat.column}</span>
              </p>
              <p style="margin: 0; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                <strong style="color: #495057;">💰 Giá vé:</strong> 
                <span style="color: #e53e3e; font-weight: bold; font-size: 18px;">
                  ${new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(ticket.price)}
                </span>
              </p>
              <p style="margin: 0; padding: 8px 0;">
                <strong style="color: #495057;">🎫 Mã vé:</strong> 
                <span style="background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #495057; border: 1px solid #dee2e6;">${
                  ticket.id
                }</span>
              </p>
            </div>
          </div>
          
          ${concessionHtml}
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">📱 Mã QR của bạn</h3>
            <div style="background-color: white; padding: 15px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 150px; max-height: 150px;">
            </div>
            <p style="color: #856404; margin: 15px 0 0 0; font-size: 14px; font-style: italic;">
              Vui lòng xuất trình mã QR này khi đến rạp
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 2px solid #e9ecef;">
            <p style="color: #667eea; font-size: 16px; margin-bottom: 10px;">
              🎉 Cảm ơn bạn đã chọn DHL Cinema!
            </p>
            <p style="color: #6c757d; margin-bottom: 20px;">
              Chúc bạn có trải nghiệm xem phim tuyệt vời! 🍿🎬
            </p>
            <p style="color: #495057; font-size: 14px; margin: 0;">
              <strong>Trân trọng,</strong><br>
              <span style="color: #667eea; font-weight: bold;">Đội ngũ DHL Cinema</span>
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
          <p style="margin: 0;">
            Email này được gửi tự động, vui lòng không trả lời trực tiếp.<br>
            Nếu có thắc mắc, hãy liên hệ với chúng tôi qua website hoặc hotline.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email xác nhận đã gửi thành công đến ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Lỗi khi gửi email xác nhận vé:", error);
    throw new Error("Không thể gửi email xác nhận vé");
  }
};

// Gửi email reset mật khẩu
exports.sendPasswordResetEmail = async (user, resetUrl) => {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || "DHL Cinema"}" <${
      process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USER
    }>`,
    to: user.email,
    subject: "🔐 Đặt lại mật khẩu - DHL Cinema",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🔐 Đặt lại mật khẩu</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Xin chào <strong>${user.name}</strong>,</p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại DHL Cinema.
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Vui lòng nhấp vào nút dưới đây để đặt lại mật khẩu:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3); transition: all 0.3s ease;">
              🔑 Đặt lại mật khẩu ngay
            </a>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 25px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              ⚠️ <strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau <strong>1 giờ</strong> kể từ khi gửi email.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 14px;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #495057; font-size: 14px; margin: 0;">
              <strong>Trân trọng,</strong><br>
              <span style="color: #667eea; font-weight: bold;">Đội ngũ DHL Cinema</span>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `📧 Email đặt lại mật khẩu đã gửi thành công đến ${user.email}`
    );
    return { success: true };
  } catch (error) {
    console.error("❌ Lỗi khi gửi email đặt lại mật khẩu:", error);
    throw new Error("Không thể gửi email đặt lại mật khẩu");
  }
};

// Gửi email xác thực tài khoản
exports.sendVerificationEmail = async (user, verificationUrl) => {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || "DHL Cinema"}" <${
      process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USER
    }>`,
    to: user.email,
    subject: "✉️ Xác thực tài khoản - DHL Cinema",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">✉️ Xác thực tài khoản</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Xin chào <strong>${user.name}</strong>,</p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            🎉 Cảm ơn bạn đã đăng ký tài khoản tại <strong>DHL Cinema</strong>!
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3); transition: all 0.3s ease;">
              ✅ Xác thực tài khoản ngay
            </a>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px; padding: 15px; margin: 25px 0;">
            <p style="color: #1565c0; margin: 0; font-size: 14px;">
              ⏰ <strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau <strong>24 giờ</strong> kể từ khi gửi email.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 14px;">
            Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #495057; font-size: 14px; margin: 0;">
              <strong>Trân trọng,</strong><br>
              <span style="color: #2196F3; font-weight: bold;">Đội ngũ DHL Cinema</span>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `📧 Email xác thực tài khoản đã gửi thành công đến ${user.email}`
    );
    return { success: true };
  } catch (error) {
    console.error("❌ Lỗi khi gửi email xác thực tài khoản:", error);
    throw new Error("Không thể gửi email xác thực tài khoản");
  }
};
