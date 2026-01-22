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
      console.log('数据库连接失败，正在重新连接');
      setTimeout(() => {
        if (count >= 60) {
          console.log('数据库连接失败，请检查数据库服务是否正常启动。');
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
          connection.query('CREATE DATABASE `xpress_rolldown_db`', () => {
            console.log('数据库创建成功');
            connection.end();
            process.exit();
          });
        } else {
          connection.end();
          process.exit();
        }
      }
    );
  });
  // connection.end();
}

connect();
