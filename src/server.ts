import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./db/client.js";

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    // initialize connection with mongdb
    await connectDB();

    // start express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
