import "./config/env.js"; // .env ən birinci yüklənməlidir
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// əvvəl DB-yə qoşul, sonra sorğu qəbul etməyə başla
await connectDB();

app.listen(PORT, (error) => {
  if (error) {
    console.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${PORT} (${process.env.NODE_ENV || "development"})`);
});
