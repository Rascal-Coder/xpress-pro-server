const mysql = require('mysql2');

let count = 0;
function connect() {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '123456',
  });

  connection.connect(error => {
    if (error) {
      console.log('数据连接失败');
      setTimeout(() => {
        if (count >= 10) {
          console.log('数据连接失败');
          return;
        }
        connect();
        count += 1;
      }, 1000);
      return;
    }
    connection.query(
      "SELECT * FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = 'xpress_rolldown_db'",
      (err, result) => {
        if (err) {
          console.log(err);
          return;
        }
        if (result.length === 0) {
          console.log('检测到数据库不存在，正在为你创建数据库...');
          connection.query('CREATE DATABASE `xpress_rolldown_db`');
        }
        connection.destroy();
        process.exit();
      }
    );
  });
}

connect();
