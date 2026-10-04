import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

/*
  Testlərdən ƏVVƏL işləyir (test faylında ilk import budur).
  Testlər ayrıca bazada (MONGO_URI_TEST) işləyir və o bazanı silir –
  əsl məlumatlara (MONGO_URI) toxunulmur.
*/
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });

const testUri = process.env.MONGO_URI_TEST;
const dbName = testUri?.match(/\/([^/?]+)(?:\?.*)?$/)?.[1];

// təhlükəsizlik: səhvən əsl bazanı silməmək üçün adı _test ilə bitməlidir
if (!dbName?.endsWith("_test")) {
  throw new Error("MONGO_URI_TEST must be set in .env and its database name must end with _test");
}

process.env.NODE_ENV = "test";
process.env.MONGO_URI = testUri;
