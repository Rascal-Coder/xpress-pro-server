import * as nodemailer from 'nodemailer';

export const sendMail = async () => {
  // 创建Nodemailer传输器 SMTP 或者 其他 运输机制
  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com', // 第三方邮箱的主机地址
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: '1755945635@qq.com', // 发送方邮箱的账号
      pass: 'lrcpntcvhbeodacb', // 邮箱授权密码
    },
  });

  // 定义transport对象并发送邮件
  const info = await transporter.sendMail({
    from: '"SuperAPI Team" <1755945635@qq.com>', // 添加发件人名称
    to: '1816895443@qq.com', // 邮箱接受者的账号
    subject: 'Hello Dooring - 欢迎使用 SuperAPI', // 更具体的主题
    text: '您好，欢迎使用 SuperAPI 服务。这是一封测试邮件。', // 提供纯文本版本
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="height: 70px; line-height: 70px; background-color: #5867dd; color: #ffffff; font-weight: 800; font-size: 20px; text-align: center;">
            SuperAPI
          </div>
          <div style="padding: 30px; color: #333333;">
            <p>您好，</p>
            <p>欢迎使用 SuperAPI 服务。这是一封测试邮件。</p>
            <p style="margin-top: 40px; color: #888888; font-size: 14px;">
              此致<br>
              QuickAPI 团队<br>
              哔哩哔哩
            </p>
            <p style="margin-top: 20px; color: #999999; font-size: 12px; border-top: 1px dashed #e0e0e0; padding-top: 20px;">
              发送时间: 2026-01-21
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  console.log(info);

  return info;
};
